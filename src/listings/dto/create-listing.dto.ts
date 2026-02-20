import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
