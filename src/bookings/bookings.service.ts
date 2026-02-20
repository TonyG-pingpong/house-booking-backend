import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateBookingDto) {
    const { listingId, startDate, endDate } = dto;

    // 1. Listing must exist
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // 2. Prevent booking your own listing
    if (listing.hostId === userId) {
      throw new ForbiddenException('You cannot book your own listing');
    }

    // 3. Date validation and overlapping bookings
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Minimum 1-night rule
    if (start >= end) {
      throw new ForbiddenException('End date must be after start date (minimum 1-night stay)');
    }

    const overlapping = await this.prisma.booking.findFirst({
      where: {
        listingId,
        startDate: { lt: end },
        endDate: { gt: start },
      },
    });

    if (overlapping) {
      throw new ForbiddenException('This listing is already booked for these dates');
    }

    // 4. Create booking
    return this.prisma.booking.create({
      data: {
        listingId,
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
  }

  findAll() {
    return this.prisma.booking.findMany();
  }

  findOne(id: number) {
    return this.prisma.booking.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: number, updateBookingDto: UpdateBookingDto, userId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        ...(updateBookingDto.listingId !== undefined && {
          listingId: updateBookingDto.listingId,
        }),
        ...(updateBookingDto.startDate && {
          startDate: new Date(updateBookingDto.startDate),
        }),
        ...(updateBookingDto.endDate && {
          endDate: new Date(updateBookingDto.endDate),
        }),
      },
    });
  }

  async remove(id: number, userId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only delete your own bookings');
    }

    return this.prisma.booking.delete({
      where: { id },
    });
  }
}
