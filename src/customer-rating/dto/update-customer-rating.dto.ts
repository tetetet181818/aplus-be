import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerRatingDto {
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  rating?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string;
}
