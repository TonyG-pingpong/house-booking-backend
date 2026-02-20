import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  senderId?: number;

  @IsOptional()
  @IsInt()
  receiverId?: number;

  @IsOptional()
  @IsInt()
  listingId?: number;
}
