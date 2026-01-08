import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'User identifier',
  })
  @IsNotEmpty({ message: 'معرّف المستخدم مطلوب' })
  @IsString({ message: 'معرّف المستخدم يجب أن يكون نصًا' })
  userId!: string;

  @ApiProperty({
    example: 'abc-123-def',
    description: 'Reset password token received via email',
  })
  @IsNotEmpty({ message: 'رمز إعادة تعيين كلمة المرور مطلوب' })
  resetPasswordToken!: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password (min 8 characters)',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  newPassword!: string;
}
