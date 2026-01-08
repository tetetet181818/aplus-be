import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCustomerRatingDto {
  @ApiProperty({
    example: 5,
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  rating!: number;

  @ApiPropertyOptional({
    example: 'Great service!',
    description: 'Optional customer comment',
  })
  @IsString()
  @IsNotEmpty()
  comment?: string;
}
