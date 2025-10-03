import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateWithdrawalDto {
  @IsNumber()
  @IsNotEmpty({
    message: 'لا تترك المبلغ فارغًا، من فضللك! 💸',
  })
  @IsOptional()
  amount?: number;

  @IsString({
    message: 'الحالة يجب أن تكون نصًا، يا حبيبي! 😊',
  })
  @IsNotEmpty({
    message: 'اختر حالة التحويل، من فضلك! 🙌',
  })
  @IsOptional()
  status?: string;

  @IsString({
    message: 'الملاحظات الإدارية يجب أن تكون نصًا، إن وجدت! 😊',
  })
  @IsOptional()
  adminNotes?: string;

  @IsString({
    message: 'اسم الحساب يجب أن يكون نصًا، يا صديقي! 😄',
  })
  @IsNotEmpty({
    message: 'أدخل اسم الحساب، من فضلك! 📝',
  })
  @IsOptional()
  accountName?: string;

  @IsString({
    message: 'اسم البنك يجب أن يكون نصًا، يا عزيزي! 😊',
  })
  @IsNotEmpty({
    message: 'لا تنسَ إدخال اسم البنك، من فضلك! 🏦',
  })
  @IsOptional()
  bankName?: string;

  @IsString({
    message: 'رقم الـ IBAN يجب أن يكون نصًا، يا حبيبي! 😄',
  })
  @IsNotEmpty({
    message: 'أدخل رقم الـ IBAN، من فضلك! 💳',
  })
  @IsOptional()
  iban?: string;

  @IsString({
    message: 'رقم التوجيه يجب أن يكون نصًا، إن وجد! 😊',
  })
  @IsOptional()
  @IsNotEmpty({
    message: 'أدخل رقم التوجيه إذا كان متاحًا، من فضلك! 📞',
  })
  routingNumber?: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'أدخل تاريخ التوجيه إذا كان متاحًا، من فضلك! 📅',
  })
  routingDate?: Date;
}
