import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateNoteDto {
  @IsOptional()
  @IsString()
  contact_method?: string;

  @IsString()
  @IsNotEmpty({ message: '📌 العنوان مطلوب' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty({ message: '💰 السعر مطلوب' })
  price: number;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsNumber()
  pages_number?: number;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  college?: string;

  @IsOptional()
  @IsString()
  university?: string;
}
