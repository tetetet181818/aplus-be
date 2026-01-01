import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(['announcement', 'question'])
  @IsOptional()
  type?: 'announcement' | 'question';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}
