import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMessageDto: CreateMessageDto, userId: number) {
    return this.prisma.message.create({
      data: {
        ...createMessageDto,
        senderId: userId,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
    });
  }

  async findOne(id: number, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id },
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
}
