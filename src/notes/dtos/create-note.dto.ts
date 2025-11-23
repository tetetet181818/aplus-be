import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @IsOptional()
  @IsString()
  contactMethod?: string;

  @IsString()
  @IsNotEmpty({ message: '📌 العنوان مطلوب' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: '💰 السعر مطلوب' })
  price: number;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  pagesNumber?: number;

  @IsOptional()
  year?: number;

  @IsOptional()
  @IsString()
  college?: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsString()
  file_path?: string;

  @IsString()
  cover_url?: string;

  @IsNotEmpty()
  termsAccepted: string;
}
