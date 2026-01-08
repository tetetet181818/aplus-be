import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CompleteWithdrawalDto {
  @ApiPropertyOptional({
    example: 'TX123456789',
    description: 'Routing or transaction number',
  })
  @IsOptional()
  @IsString()
  routingNumber!: string;

  @ApiPropertyOptional({
    example: '2023-10-27T10:00:00Z',
    description: 'Routing date',
  })
  @IsOptional()
  routingDate!: Date;
}
