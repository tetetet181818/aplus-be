import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateWithdrawalDto {
  @ApiPropertyOptional({ example: 1200 })
  @IsNumber()
  @IsNotEmpty({
    message: 'لا تترك المبلغ فارغًا، من فضللك! 💸',
  })
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    example: 'completed',
    description: 'Status of the withdrawal',
  })
  @IsString({
    message: 'الحالة يجب أن تكون نصًا، يا حبيبي! 😊',
  })
  @IsNotEmpty({
    message: 'اختر حالة التحويل، من فضلك! 🙌',
  })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Payment sent to user bank account.' })
  @IsString({
    message: 'الملاحظات الإدارية يجب أن تكون نصًا، إن وجدت! 😊',
  })
  @IsOptional()
  adminNotes?: string;

  @ApiPropertyOptional({ example: 'John Updated Doe' })
  @IsString({
    message: 'اسم الحساب يجب أن يكون نصًا، يا صديقي! 😄',
  })
  @IsNotEmpty({
    message: 'أدخل اسم الحساب، من فضلك! 📝',
  })
  @IsOptional()
  accountName?: string;

  @ApiPropertyOptional({ example: 'Samba Bank' })
  @IsString({
    message: 'اسم البنك يجب أن يكون نصًا، يا عزيزي! 😊',
  })
  @IsNotEmpty({
    message: 'لا تنسَ إدخال اسم البنك، من فضلك! 🏦',
  })
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ example: 'SA9876543210987654321098' })
  @IsString({
    message: 'رقم الـ IBAN يجب أن يكون نصًا، يا حبيبي! 😄',
  })
  @IsNotEmpty({
    message: 'أدخل رقم الـ IBAN، من فضلك! 💳',
  })
  @IsOptional()
  iban?: string;

  @ApiPropertyOptional({ example: '54321' })
  @IsString({
    message: 'رقم التوجيه يجب أن يكون نصًا، إن وجد! 😊',
  })
  @IsOptional()
  @IsNotEmpty({
    message: 'أدخل رقم التوجيه إذا كان متاحًا، من فضلك! 📞',
  })
  routingNumber?: string;

  @ApiPropertyOptional({ example: '2023-10-05T10:00:00.000Z' })
  @IsOptional()
  @IsNotEmpty({
    message: 'أدخل تاريخ التوجيه إذا كان متاحًا، من فضلك! 📅',
  })
  routingDate?: Date;
}
