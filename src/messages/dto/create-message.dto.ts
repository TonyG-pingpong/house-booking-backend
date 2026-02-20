import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsInt()
  senderId: number;

  @IsInt()
  receiverId: number;

  @IsOptional()
  @IsInt()
  listingId?: number;
}
