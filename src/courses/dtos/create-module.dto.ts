import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({
    example: 'Introduction to NestJS',
    description: 'Title of the course module',
  })
  @IsString()
  @IsNotEmpty({ message: 'عنوان الوحدة مطلوب' })
  title!: string;
}
