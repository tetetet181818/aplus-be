import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @ApiPropertyOptional({ example: 'WhatsApp' })
  @IsOptional()
  @IsString()
  contactMethod?: string;

  @ApiProperty({
    example: 'Calculation 1 Notes',
    description: 'Title of the notes',
  })
  @IsString()
  @IsNotEmpty({ message: '📌 العنوان مطلوب' })
  title!: string;

  @ApiPropertyOptional({
    example: 'Detailed notes covering all chapters of Calculation 1.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 45, description: 'Price of the notes' })
  @IsNotEmpty({ message: '💰 السعر مطلوب' })
  price!: number;

  @ApiPropertyOptional({ example: 'Mathematics' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  pagesNumber?: number;

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional()
  @IsString()
  college?: string;

  @ApiPropertyOptional({ example: 'King Saud University' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiProperty({
    example: 'true',
    description: 'Agreement to terms and conditions',
  })
  @IsNotEmpty()
  termsAccepted!: string;
}
