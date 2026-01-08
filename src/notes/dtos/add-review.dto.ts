import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class AddReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1, { message: '⭐ التقييم يجب أن يكون على الأقل 1' })
  @Max(5, { message: '⭐ التقييم يجب أن لا يزيد عن 5' })
  rating!: number;

  @ApiProperty({
    example: 'Excellent course, highly recommend!',
    description: 'Review comment',
  })
  @IsString()
  @IsNotEmpty({ message: '💬 التعليق لا يمكن أن يكون فارغاً' })
  comment!: string;
}
