import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsString,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'الاسم يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'من فضلك أدخل الاسم الكامل' })
  fullName: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح، برجاء إدخال بريد صالح' })
  email: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @MinLength(6, { message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'اسم الجامعة يجب أن يكون نصاً' })
  university?: string;
}
