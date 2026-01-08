import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({ example: 1000, description: 'Amount to withdraw' })
  @IsNumber()
  @IsNotEmpty({ message: 'لا تترك المبلغ فارغًا، من فضلك! 💸' })
  amount!: number;

  @ApiProperty({ example: 'John Doe', description: 'Account holder name' })
  @IsString({ message: 'اسم الحساب يجب أن يكون نصًا، يا صديقي! 😄' })
  @IsNotEmpty({ message: 'أدخل اسم الحساب، من فضلك! 📝' })
  accountName!: string;

  @ApiProperty({ example: 'Al Rajhi Bank', description: 'Bank name' })
  @IsString({ message: 'اسم البنك يجب أن يكون نصًا، يا عزيزي! 😊' })
  @IsNotEmpty({ message: 'لا تنسَ إدخل اسم البنك، من فضلك! 🏦' })
  bankName!: string;

  @ApiProperty({
    example: 'SA1234567890123456789012',
    description: 'IBAN number',
  })
  @IsString({ message: 'رقم الـ IBAN يجب أن يكون نصًا، يا حبيبي! 😄' })
  @IsNotEmpty({ message: 'أدخل رقم الـ IBAN، من فضلك! 💳' })
  iban!: string;

  @ApiPropertyOptional({
    example: '12345',
    description: 'Routing number if applicable',
  })
  @IsString({ message: 'رقم التوجيه يجب أن يكون نصًا، إن وجد! 😊' })
  @IsOptional()
  routingNumber?: string;

  @ApiPropertyOptional({
    example: '2023-10-01T00:00:00.000Z',
    description: 'Routing date if applicable',
  })
  @IsDate({ message: 'تاريخ التوجيه يجب أن يكون تاريخًا صالحًا، يا صديقي! 😄' })
  @IsOptional()
  routingDate?: Date;
}
