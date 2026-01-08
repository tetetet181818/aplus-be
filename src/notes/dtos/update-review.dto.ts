import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '⭐ التقييم يجب أن يكون على الأقل 1' })
  @Max(5, { message: '⭐ التقييم يجب أن لا يزيد عن 5' })
  rating?: number;

  @ApiPropertyOptional({ example: 'Actually, it was pretty good.' })
  @IsOptional()
  @IsString()
  comment?: string;
}
