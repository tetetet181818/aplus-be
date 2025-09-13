import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class AddReviewDto {
  @IsNumber()
  @Min(1, { message: '⭐ التقييم يجب أن يكون على الأقل 1' })
  @Max(5, { message: '⭐ التقييم يجب أن لا يزيد عن 5' })
  rating: number;

  @IsString()
  @IsNotEmpty({ message: '💬 التعليق لا يمكن أن يكون فارغاً' })
  comment: string;
}
