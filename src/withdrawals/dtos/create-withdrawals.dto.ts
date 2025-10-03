import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber()
  @IsNotEmpty({ message: 'لا تترك المبلغ فارغًا، من فضلك! 💸' })
  amount: number;

  @IsString({ message: 'اسم الحساب يجب أن يكون نصًا، يا صديقي! 😄' })
  @IsNotEmpty({ message: 'أدخل اسم الحساب، من فضلك! 📝' })
  accountName: string;

  @IsString({ message: 'اسم البنك يجب أن يكون نصًا، يا عزيزي! 😊' })
  @IsNotEmpty({ message: 'لا تنسَ إدخال اسم البنك، من فضلك! 🏦' })
  bankName: string;

  @IsString({ message: 'رقم الـ IBAN يجب أن يكون نصًا، يا حبيبي! 😄' })
  @IsNotEmpty({ message: 'أدخل رقم الـ IBAN، من فضلك! 💳' })
  iban: string;

  @IsString({ message: 'رقم التوجيه يجب أن يكون نصًا، إن وجد! 😊' })
  @IsOptional()
  routingNumber?: string;

  @IsDate({ message: 'تاريخ التوجيه يجب أن يكون تاريخًا صالحًا، يا صديقي! 😄' })
  @IsOptional()
  routingDate?: Date;
}
