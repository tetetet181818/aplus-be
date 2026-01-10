import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'العنوان مطلوب' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'الوصف مطلوب' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'القسم مطلوب' })
  category!: string;

  @IsString()
  @IsNotEmpty({ message: 'السعر مطلوب' })
  price?: string;

  @IsString()
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  ownerPhone!: string;
}
