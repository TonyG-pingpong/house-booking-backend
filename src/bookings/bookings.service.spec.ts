import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockListing = {
    id: 1,
    title: 'Loft',
    hostId: 2,
  };

  const mockBooking = {
    id: 1,
    listingId: 1,
    userId: 1,
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-03'),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrisma = {
      listing: { findUnique: jest.fn() },
      booking: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws NotFoundException when listing does not exist', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.create(1, {
          listingId: 99,
          startDate: '2025-06-01',
          endDate: '2025-06-03',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when booking own listing', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        ...mockListing,
        hostId: 1,
      });
      await expect(
        service.create(1, {
          listingId: 1,
          startDate: '2025-06-01',
          endDate: '2025-06-03',
        } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when end date is not after start date', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(mockListing);
      await expect(
        service.create(1, {
          listingId: 1,
          startDate: '2025-06-03',
          endDate: '2025-06-01',
        } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when dates overlap existing booking', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(mockListing);
      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(mockBooking);
      await expect(
        service.create(1, {
          listingId: 1,
          startDate: '2025-06-02',
          endDate: '2025-06-04',
        } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates booking when listing exists and dates are free', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(mockListing);
      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.booking.create as jest.Mock).mockResolvedValue(mockBooking);
      const result = await service.create(1, {
        listingId: 1,
        startDate: '2025-06-01',
        endDate: '2025-06-03',
      } as any);
      expect(result).toEqual(mockBooking);
      expect(prisma.booking.create).toHaveBeenCalledWith({
        data: {
          listingId: 1,
          userId: 1,
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-03'),
        },
      });
    });
  });

  describe('update', () => {
    it('throws ForbiddenException when user is not the booker', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      await expect(
        service.update(1, { startDate: '2025-06-05' } as any, 999),
      ).rejects.toThrow(ForbiddenException);
    });

    it('updates booking when user is the booker', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        startDate: new Date('2025-06-05'),
      });
      await service.update(1, { startDate: '2025-06-05' } as any, 1);
      expect(prisma.booking.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when booking does not exist', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when user is not the booker', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      await expect(service.remove(1, 999)).rejects.toThrow(ForbiddenException);
    });

    it('deletes booking when user is the booker', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.delete as jest.Mock).mockResolvedValue(mockBooking);
      await service.remove(1, 1);
      expect(prisma.booking.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
