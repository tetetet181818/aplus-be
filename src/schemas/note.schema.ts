import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NoteDocument = Note & Document;

/**
 * Review Subdocument Schema
 */
@Schema({ _id: true, timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, required: false })
  _id: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String, required: true })
  comment: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userName: string;
}

@Schema({ timestamps: true })
export class Note {
  @Prop({ type: String, required: true })
  file_path: string;

  @Prop({ type: [String], required: false, default: [] })
  purchased_by?: string[];

  @Prop({ type: [Review], default: [] })
  reviews: Review[];

  @Prop({ type: String, required: false })
  contactMethod: string;

  @Prop({ type: String, required: false })
  cover_url: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true, default: 0 })
  price: number;

  @Prop({ type: String, required: true })
  subject: string;

  @Prop({ type: String, required: true })
  owner_id: string;

  @Prop({ type: Number, required: true })
  pagesNumber: number;

  @Prop({ type: Number, required: true })
  year: number;

  @Prop({ type: String, required: true })
  college: string;

  @Prop({ type: String, required: true })
  university: string;

  @Prop({ type: String })
  file_url?: string;

  @Prop({ type: Number, default: 0 })
  downloads: number;

  @Prop({ type: Boolean, default: true })
  isPublish: boolean;

  @Prop({ type: Boolean, default: true })
  termsAccepted: boolean;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
