import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Updated Course Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 149.99, description: 'Updated price' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'السعر يجب أن يكون أكبر من أو يساوي صفر' })
  price?: number;

  @ApiPropertyOptional({ example: '+966987654321' })
  @IsOptional()
  @IsString()
  ownerPhone?: string;
}
