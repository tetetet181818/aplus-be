import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@Schema({ timestamps: true })
export class Announcement {
  @Prop({ type: String, required: true, index: true })
  courseId!: string;

  @Prop({ type: String, required: true })
  creatorId!: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  content!: string;

  @Prop({
    type: String,
    enum: ['announcement', 'question'],
    default: 'announcement',
  })
  type!: 'announcement' | 'question';

  @Prop({ type: [String], default: [] })
  options!: string[];

  @Prop({
    type: [
      {
        studentId: { type: String, required: true },
        answer: { type: String, required: true },
        respondedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  responses!: Array<{
    studentId: string;
    answer: string;
    respondedAt: Date;
  }>;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
AnnouncementSchema.index({ courseId: 1, createdAt: -1 });
