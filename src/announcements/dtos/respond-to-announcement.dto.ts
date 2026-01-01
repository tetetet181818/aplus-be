import { IsString, IsNotEmpty } from 'class-validator';

export class RespondToAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  answer!: string;
}
