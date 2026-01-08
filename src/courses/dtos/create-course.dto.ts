import { IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'العنوان مطلوب' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'الوصف مطلوب' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'السعر مطلوب' })
  price?: string;

  @IsString()
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  ownerPhone!: string;
}
