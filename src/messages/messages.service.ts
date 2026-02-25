import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

const messageInclude = {
  sender: { select: { id: true, email: true } },
  receiver: { select: { id: true, email: true } },
  listing: { select: { id: true, title: true } },
};

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMessageDto: CreateMessageDto, userId: number) {
    return this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        receiverId: createMessageDto.receiverId,
        listingId: createMessageDto.listingId,
        senderId: userId,
      },
      include: messageInclude,
    });
  }

  findAll(userId: number, since?: string) {
    const where: Record<string, unknown> = {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };
    if (since) {
      const sinceDate = new Date(since);
      if (!Number.isNaN(sinceDate.getTime())) {
        where.createdAt = { gt: sinceDate };
      }
    }
    return this.prisma.message.findMany({
      where,
      include: messageInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: messageInclude,
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('You can only read messages you sent or received');
    }

    return message;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only update messages you sent');
    }

    return this.prisma.message.update({
      where: { id },
      data: updateMessageDto,
      include: messageInclude,
    });
  }

  async remove(id: number, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete messages you sent');
    }

    return this.prisma.message.delete({
      where: { id },
    });
  }

  /** Delete all messages in a thread (conversation with one other user, optionally about one listing). */
  async removeThread(userId: number, otherUserId: number, listingId?: number | null) {
    const listingFilter = listingId == null || listingId === 0 ? null : listingId;
    const where = {
      OR: [
        {
          senderId: userId,
          receiverId: otherUserId,
          ...(listingFilter !== null ? { listingId: listingFilter } : { listingId: null }),
        },
        {
          senderId: otherUserId,
          receiverId: userId,
          ...(listingFilter !== null ? { listingId: listingFilter } : { listingId: null }),
        },
      ],
    };
    const result = await this.prisma.message.deleteMany({ where });
    return { deleted: result.count };
  }
}
