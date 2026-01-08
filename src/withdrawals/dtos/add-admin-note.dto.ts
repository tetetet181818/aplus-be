import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddAdminNoteDto {
  @ApiProperty({
    example: 'Transaction verified and processed.',
    description: 'Admin notes for the withdrawal',
  })
  @IsNotEmpty()
  @IsString()
  adminNotes!: string;
}
