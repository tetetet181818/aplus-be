import { IsOptional, IsString } from 'class-validator';

export class CompleteWithdrawalDto {
  @IsOptional()
  @IsString()
  routingNumber!: string;

  @IsOptional()
  routingDate!: Date;
}
