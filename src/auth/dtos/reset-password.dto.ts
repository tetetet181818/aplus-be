import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'معرّف المستخدم مطلوب' })
  @IsString({ message: 'معرّف المستخدم يجب أن يكون نصًا' })
  userId!: string;

  @IsNotEmpty({ message: 'رمز إعادة تعيين كلمة المرور مطلوب' })
  resetPasswordToken!: string;

  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  newPassword!: string;
}
