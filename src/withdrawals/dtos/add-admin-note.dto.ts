import { IsNotEmpty, IsString } from 'class-validator';

export class AddAdminNoteDto {
  @IsNotEmpty()
  @IsString()
  adminNotes: string;
}
