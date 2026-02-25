import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MessagesService', () => {
  let service: MessagesService;
  let prisma: jest.Mocked<PrismaService>;

  const mockMessage = {
    id: 1,
    content: 'Hello',
    createdAt: new Date(),
    senderId: 1,
    receiverId: 2,
    listingId: null,
    sender: { id: 1, email: 'a@b.com' },
    receiver: { id: 2, email: 'b@b.com' },
    listing: null,
  };

  beforeEach(async () => {
    const mockPrisma = {
      message: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a message with senderId from userId', async () => {
      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);
      const dto = { content: 'Hello', receiverId: 2 };
      const result = await service.create(dto as any, 1);
      expect(result).toEqual(mockMessage);
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          content: 'Hello',
          receiverId: 2,
          listingId: undefined,
          senderId: 1,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('returns messages where user is sender or receiver', async () => {
      (prisma.message.findMany as jest.Mock).mockResolvedValue([mockMessage]);
      const result = await service.findAll(1);
      expect(result).toEqual([mockMessage]);
      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ senderId: 1 }, { receiverId: 1 }],
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('filters by since when provided (instant chat / polling)', async () => {
      (prisma.message.findMany as jest.Mock).mockResolvedValue([mockMessage]);
      const since = '2025-06-01T12:00:00.000Z';
      await service.findAll(1, since);
      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ senderId: 1 }, { receiverId: 1 }],
          createdAt: { gt: new Date(since) },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when message does not exist', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when user is not sender or receiver', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage);
      await expect(service.findOne(1, 999)).rejects.toThrow(ForbiddenException);
    });

    it('returns message when user is sender', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage);
      const result = await service.findOne(1, 1);
      expect(result).toEqual(mockMessage);
    });

    it('returns message when user is receiver', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage);
      const result = await service.findOne(1, 2);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('update', () => {
    it('throws ForbiddenException when user is not the sender', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage);
      await expect(
        service.update(1, { content: 'Updated' } as any, 2),
      ).rejects.toThrow(ForbiddenException);
    });

    it('updates message when user is the sender', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage);
      (prisma.message.update as jest.Mock).mockResolvedValue({
        ...mockMessage,
        content: 'Updated',
      });
      const result = await service.update(1, { content: 'Updated' } as any, 1);
      expect(result.content).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('throws ForbiddenException when user is not the sender', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage);
      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('deletes message when user is the sender', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage);
      (prisma.message.delete as jest.Mock).mockResolvedValue(mockMessage);
      await service.remove(1, 1);
      expect(prisma.message.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('removeThread', () => {
    it('deletes all messages in thread with listingId', async () => {
      (prisma.message.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });
      const result = await service.removeThread(1, 2, 10);
      expect(result).toEqual({ deleted: 3 });
      expect(prisma.message.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { senderId: 1, receiverId: 2, listingId: 10 },
            { senderId: 2, receiverId: 1, listingId: 10 },
          ],
        },
      });
    });

    it('deletes all messages in thread without listing (listingId null)', async () => {
      (prisma.message.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
      const result = await service.removeThread(1, 2, null);
      expect(result).toEqual({ deleted: 2 });
      expect(prisma.message.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { senderId: 1, receiverId: 2, listingId: null },
            { senderId: 2, receiverId: 1, listingId: null },
          ],
        },
      });
    });

    it('deletes all messages in thread when listingId is undefined or 0', async () => {
      (prisma.message.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      await service.removeThread(5, 6, undefined);
      expect(prisma.message.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { senderId: 5, receiverId: 6, listingId: null },
            { senderId: 6, receiverId: 5, listingId: null },
          ],
        },
      });
      (prisma.message.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      await service.removeThread(5, 6, 0);
      expect(prisma.message.deleteMany).toHaveBeenLastCalledWith({
        where: {
          OR: [
            { senderId: 5, receiverId: 6, listingId: null },
            { senderId: 6, receiverId: 5, listingId: null },
          ],
        },
      });
    });

    it('returns deleted count from deleteMany', async () => {
      (prisma.message.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });
      const result = await service.removeThread(1, 2, 7);
      expect(result).toEqual({ deleted: 5 });
    });
  });
});
