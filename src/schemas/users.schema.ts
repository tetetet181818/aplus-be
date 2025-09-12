import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ type: String, required: true, minlength: 6 })
  password: string;

  @Prop({ type: String, default: 'student', enum: ['student', 'admin'] })
  role: string;

  @Prop({ type: String, required: false, default: null })
  university: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
