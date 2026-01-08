import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateNoteDto {
  @ApiPropertyOptional({ example: 'WhatsApp' })
  @IsOptional()
  @IsString()
  contact_method?: string;

  @ApiPropertyOptional({ example: 'Calculation 1 Notes' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Detailed notes for Calculation 1 course.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 45.5,
    description: 'Price in local currency',
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'Mathematics' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  pages_number?: number;

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional()
  @IsString()
  college?: string;

  @ApiPropertyOptional({ example: 'King Saud University' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional({ example: '120' })
  @IsOptional()
  pagesNumber?: string;

  @ApiPropertyOptional({ example: 'WhatsApp' })
  @IsOptional()
  @IsString()
  contactMethod?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublish?: boolean;
}
