import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'King Saud University',
    description: 'Updated university name',
  })
  @IsOptional()
  @IsString({ message: 'الجامعة يجب أن تكون نصاً' })
  university?: string;
}
