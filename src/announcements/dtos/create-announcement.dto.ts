import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({
    example: 'Important Update',
    description: 'Title of the announcement',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Please read the updated syllabus.',
    description: 'Content of the announcement',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({
    example: 'announcement',
    enum: ['announcement', 'question'],
  })
  @IsEnum(['announcement', 'question'])
  @IsOptional()
  type?: 'announcement' | 'question';

  @ApiPropertyOptional({
    example: ['Option 1', 'Option 2'],
    description: 'Options if the type is question',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}
