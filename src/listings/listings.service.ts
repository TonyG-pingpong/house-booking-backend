import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createListingDto: CreateListingDto, userId: number) {
    return this.prisma.listing.create({
      data: {
        ...createListingDto,
        hostId: userId,
      },
    });
  }

  findAll() {
    return this.prisma.listing.findMany();
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

    return this.prisma.listing.update({
      where: { id },
      data: updateListingDto,
    });
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
