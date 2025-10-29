import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCustomerRatingDto {
  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment?: string;
}
