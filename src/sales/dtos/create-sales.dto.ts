import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateSalesDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  note_id: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsString()
  @IsNotEmpty()
  note_title: string;

  @IsString()
  @IsNotEmpty()
  invoice_id: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  platform_fee: string;

  @IsString()
  @IsNotEmpty()
  buyerId: string;
}
