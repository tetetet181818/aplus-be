import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop({ default: 'info' })
  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'withdrawal'
    | 'sales'
    | 'auth'
    | 'notes';
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
