import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Withdrawal extends Document {
  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: false })
  admin_notes: string;

  @Prop({ type: String, required: true })
  account_name: string;

  @Prop({ type: String, required: true })
  bank_name: string;

  @Prop({ type: String, required: true })
  iban: string;

  @Prop({ type: String, required: false })
  routing_number: string;

  @Prop({ type: Date, required: false })
  routing_date: Date;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
