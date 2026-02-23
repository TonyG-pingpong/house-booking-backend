import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ListingsService', () => {
  let service: ListingsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockListing = {
    id: 1,
    title: 'Cozy loft',
    description: 'Nice place',
    price: 100,
    location: 'London',
    imageUrl: null,
    createdAt: new Date(),
    hostId: 1,
  };

  beforeEach(async () => {
    const mockPrisma = {
      listing: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a listing with hostId', async () => {
      (prisma.listing.create as jest.Mock).mockResolvedValue(mockListing);
      const dto = {
        title: 'Cozy loft',
        description: 'Nice place',
        price: 100,
        location: 'London',
      };
      const result = await service.create(dto as any, 1);
      expect(result).toEqual(mockListing);
      expect(prisma.listing.create).toHaveBeenCalledWith({
        data: { ...dto, hostId: 1 },
      });
    });
  });

  describe('findAll', () => {
    it('returns all listings', async () => {
      (prisma.listing.findMany as jest.Mock).mockResolvedValue([mockListing]);
      const result = await service.findAll();
      expect(result).toEqual([mockListing]);
      expect(prisma.listing.findMany).toHaveBeenCalled();
    });
  });

  describe('findByHost', () => {
    it('returns listings for the given host', async () => {
      (prisma.listing.findMany as jest.Mock).mockResolvedValue([mockListing]);
      const result = await service.findByHost(1);
      expect(result).toEqual([mockListing]);
      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: { hostId: 1 },
      });
    });
  });

  describe('findOne', () => {
    it('returns a listing by id', async () => {
      (prisma.listing.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockListing);
      const result = await service.findOne(1);
      expect(result).toEqual(mockListing);
      expect(prisma.listing.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('update', () => {
    it('throws NotFoundException when listing does not exist', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.update(99, { title: 'New' } as any, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when user is not the host', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        ...mockListing,
        hostId: 1,
      });
      await expect(
        service.update(1, { title: 'New' } as any, 999),
      ).rejects.toThrow(ForbiddenException);
    });

    it('updates listing when user is the host', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(mockListing);
      (prisma.listing.update as jest.Mock).mockResolvedValue({
        ...mockListing,
        title: 'Updated',
      });
      const result = await service.update(1, { title: 'Updated' } as any, 1);
      expect(result.title).toBe('Updated');
      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'Updated' },
      });
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when listing does not exist', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when user is not the host', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(mockListing);
      await expect(service.remove(1, 999)).rejects.toThrow(ForbiddenException);
    });

    it('deletes listing when user is the host', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(mockListing);
      (prisma.listing.delete as jest.Mock).mockResolvedValue(mockListing);
      await service.remove(1, 1);
      expect(prisma.listing.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
