import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentLinkDto {
  @IsString()
  @IsNotEmpty()
  noteId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;
}
