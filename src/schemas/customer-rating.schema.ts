import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerRatingDocument = CustomerRating & Document;

@Schema({ timestamps: true })
export class CustomerRating {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  customerId!: string;

  @Prop({ type: Number, required: true })
  rating!: number;

  @Prop({ type: String, required: true })
  fullName!: string;

  @Prop({ type: String, required: true })
  comment!: string;

  @Prop({ type: Boolean, default: true })
  isPublish!: boolean;
}

export const CustomerRatingSchema =
  SchemaFactory.createForClass(CustomerRating);
