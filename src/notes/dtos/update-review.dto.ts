import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: '⭐ التقييم يجب أن يكون على الأقل 1' })
  @Max(5, { message: '⭐ التقييم يجب أن لا يزيد عن 5' })
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
