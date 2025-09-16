import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Sales extends Document {
  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, required: true })
  note_id: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: true })
  payment_method: string;

  @Prop({ type: String, required: true })
  note_title: string;

  @Prop({ type: String, required: true })
  invoice_id: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, required: true })
  platform_fee: string;

  @Prop({ type: String, required: true })
  buyerId: string;
}

export const SalesSchema = SchemaFactory.createForClass(Sales);
