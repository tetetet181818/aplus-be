import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'الاسم الكامل يجب أن يكون نصاً' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'الجامعة يجب أن تكون نصاً' })
  university?: string;
}
