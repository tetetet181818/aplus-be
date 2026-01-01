import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class AddLessonDto {
  @IsString()
  @IsNotEmpty({ message: 'عنوان الدرس مطلوب' })
  title!: string;

  @IsOptional()
  @IsEnum(['published', 'unpublished'], {
    message: 'الحالة يجب أن تكون published أو unpublished',
  })
  status?: 'published' | 'unpublished';
}

