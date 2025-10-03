import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'الجامعة يجب أن تكون نصاً' })
  university?: string;
}
