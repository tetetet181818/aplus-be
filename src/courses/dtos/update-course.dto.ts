import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'السعر يجب أن يكون أكبر من أو يساوي صفر' })
  price?: number;

  @IsOptional()
  @IsString()
  ownerPhone?: string;
}

