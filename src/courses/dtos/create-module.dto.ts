import { IsNotEmpty, IsString } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty({ message: 'عنوان الوحدة مطلوب' })
  title!: string;
}

