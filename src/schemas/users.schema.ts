import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ type: String, required: false, minlength: 6 })
  password?: string;

  @Prop({ type: String, required: false })
  university: string;

  @Prop({ type: String, default: 'student', enum: ['student', 'admin'] })
  role: string;

  @Prop({ type: Number, required: false, default: 0 })
  balance: number;

  @Prop({ type: Array, required: false, default: [] })
  likesList: object[];

  @Prop({ type: Number, default: 2 })
  withdrawalTimes: number;

  @Prop({ type: String, required: false, default: null })
  resetPasswordToken: string | null;

  @Prop({ type: Date, default: () => new Date() })
  lastWithdrawalReset: Date;

  @Prop({ type: Number })
  resetPasswordExpires: number;

  @Prop({ default: 'local' })
  provider: 'local' | 'google';

  @Prop({
    type: [
      {
        note_id: { type: Types.ObjectId, ref: 'Note' },
        title: String,
        price: Number,
        owner_id: { type: Types.ObjectId, ref: 'User' },
        cover_url: String,
        downloads: Number,
        year: String,
        subject: String,
        university: String,
        file_path: String,
        college: String,
        saleId: String,
        description: String,
      },
    ],
    default: [],
  })
  purchased_notes: Array<{
    note_id: string;
    title: string;
    price: number;
    owner_id: string;
    cover_url: string;
    file_path: string;
    downloads: number;
    year: string;
    subject: string;
    university: string;
    college: string;
    saleId: string;
    description: string;
  }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
