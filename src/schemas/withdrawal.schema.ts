import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Withdrawal extends Document {
  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({
    type: String,
    required: false,
    default: 'pending',
    enum: ['pending', 'accepted', 'rejected', 'completed'],
  })
  status!: string;

  @Prop({ type: String, required: false })
  adminNotes!: string;

  @Prop({ type: String, required: true })
  accountName!: string;

  @Prop({ type: String, required: true })
  bankName!: string;

  @Prop({ type: String, required: true })
  iban!: string;

  @Prop({ type: String, required: false })
  routingNumber!: string;

  @Prop({ type: Date, required: false })
  routingDate!: Date;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
