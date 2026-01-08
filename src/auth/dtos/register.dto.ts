import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsString,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString({ message: 'الاسم يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'من فضلك أدخل الاسم الكامل' })
  fullName!: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح، برجاء إدخال بريد صالح' })
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (min 6 characters)',
    minLength: 6,
  })
  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @MinLength(6, { message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' })
  password?: string;

  @ApiPropertyOptional({
    example: 'King Saud University',
    description: 'University name',
  })
  @IsOptional()
  @IsString({ message: 'اسم الجامعة يجب أن يكون نصاً' })
  university?: string;
}
