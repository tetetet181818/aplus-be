import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateWithdrawalDto {
  @IsString({
    message: 'معرف المستخدم يجب أن يكون نصًا، يا صديقي! 😊',
  })
  @IsNotEmpty({
    message: 'لا تنسَ إدخال معرف المستخدم، من فضلك! 🙏',
  })
  user_id: string;

  @IsNumber()
  @IsNotEmpty({
    message: 'لا تترك المبلغ فارغًا، من فضللك! 💸',
  })
  amount: number;

  @IsString({
    message: 'الحالة يجب أن تكون نصًا، يا حبيبي! 😊',
  })
  @IsNotEmpty({
    message: 'اختر حالة التحويل، من فضلك! 🙌',
  })
  status: string;

  @IsString({
    message: 'الملاحظات الإدارية يجب أن تكون نصًا، إن وجدت! 😊',
  })
  @IsOptional()
  admin_notes?: string;

  @IsString({
    message: 'اسم الحساب يجب أن يكون نصًا، يا صديقي! 😄',
  })
  @IsNotEmpty({
    message: 'أدخل اسم الحساب، من فضلك! 📝',
  })
  account_name: string;

  @IsString({
    message: 'اسم البنك يجب أن يكون نصًا، يا عزيزي! 😊',
  })
  @IsNotEmpty({
    message: 'لا تنسَ إدخال اسم البنك، من فضلك! 🏦',
  })
  bank_name: string;

  @IsString({
    message: 'رقم الـ IBAN يجب أن يكون نصًا، يا حبيبي! 😄',
  })
  @IsNotEmpty({
    message: 'أدخل رقم الـ IBAN، من فضلك! 💳',
  })
  iban: string;

  @IsString({
    message: 'رقم التوجيه يجب أن يكون نصًا، إن وجد! 😊',
  })
  @IsOptional()
  @IsNotEmpty({
    message: 'أدخل رقم التوجيه إذا كان متاحًا، من فضلك! 📞',
  })
  routing_number?: string;

  @IsDate({
    message: 'تاريخ التوجيه يجب أن يكون تاريخًا صالحًا، يا صديقي! 😄',
  })
  @IsOptional()
  @IsNotEmpty({
    message: 'أدخل تاريخ التوجيه إذا كان متاحًا، من فضلك! 📅',
  })
  routing_date?: Date;
}
