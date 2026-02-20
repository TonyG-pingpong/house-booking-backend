import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsInt()
  listingId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}