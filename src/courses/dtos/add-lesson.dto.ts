import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class AddLessonDto {
  @ApiProperty({
    example: 'Getting Started with Controllers',
    description: 'Lesson title',
  })
  @IsString()
  @IsNotEmpty({ message: 'عنوان الدرس مطلوب' })
  title!: string;

  @ApiPropertyOptional({
    enum: ['published', 'unpublished'],
    default: 'unpublished',
    description: 'Publication status of the lesson',
  })
  @IsOptional()
  @IsEnum(['published', 'unpublished'], {
    message: 'الحالة يجب أن تكون published أو unpublished',
  })
  status?: 'published' | 'unpublished';
}
