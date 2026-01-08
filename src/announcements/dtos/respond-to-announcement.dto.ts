import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RespondToAnnouncementDto {
  @ApiProperty({
    example: 'I choose Option 1',
    description: 'Answer or response text',
  })
  @IsString()
  @IsNotEmpty()
  answer!: string;
}
