import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateSalesDto {
  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'ID of the seller',
  })
  @IsString()
  @IsNotEmpty()
  sellerId!: string;

  @ApiProperty({
    example: '60d0fe4f5311236168a109cb',
    description: 'ID of the buyer',
  })
  @IsString()
  @IsNotEmpty()
  buyerId!: string;

  @ApiProperty({
    example: '60d0fe4f5311236168a109cc',
    description: 'ID of the note',
  })
  @IsString()
  @IsNotEmpty()
  note_id!: string;

  @ApiProperty({ example: 'completed', description: 'Status of the sale' })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty({ example: 45.0, description: 'Sale amount' })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ example: 5.0, description: 'Platform commission' })
  @IsNumber()
  @IsNotEmpty()
  commission!: number;

  @ApiProperty({ example: 'Credit Card', description: 'Method of payment' })
  @IsString()
  @IsNotEmpty()
  payment_method!: string;

  @ApiProperty({
    example: 'Calculation 1 Notes',
    description: 'Title of the note sold',
  })
  @IsString()
  @IsNotEmpty()
  note_title!: string;

  @ApiProperty({ example: 'INV-2023-001', description: 'Invoice identifier' })
  @IsString()
  @IsNotEmpty()
  invoice_id!: string;

  @ApiProperty({
    example: 'Thank you for your purchase!',
    description: 'Optional message',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ example: '2.50', description: 'Fixed platform fee' })
  @IsString()
  @IsNotEmpty()
  platform_fee!: string;
}
