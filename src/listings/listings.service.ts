import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  private handlePrismaError(err: unknown): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2003') {
        throw new InternalServerErrorException('Invalid reference (e.g. host not found).');
      }
      if (err.code === 'P2025') {
        throw new NotFoundException('Record not found.');
      }
      throw new InternalServerErrorException(`Database error: ${err.message}`);
    }
    if (err instanceof Error) {
      throw new InternalServerErrorException(err.message);
    }
    throw err;
  }

  async create(createListingDto: CreateListingDto, userId: number) {
    try {
      return await this.prisma.listing.create({
        data: {
          ...createListingDto,
          hostId: userId,
        },
      });
    } catch (err) {
      this.handlePrismaError(err);
    }
  }

  findAll() {
    return this.prisma.listing.findMany();
  }

  findByHost(userId: number) {
    return this.prisma.listing.findMany({
      where: { hostId: userId },
    });
  }

  findOne(id: number) {
    return this.prisma.listing.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: number, updateListingDto: UpdateListingDto, userId: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    if (listing.hostId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    try {
      return await this.prisma.listing.update({
        where: { id },
        data: updateListingDto,
      });
    } catch (err) {
      this.handlePrismaError(err);
    }
  }

  async remove(id: number, userId: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    if (listing.hostId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    return this.prisma.listing.delete({
      where: { id },
    });
  }
}
