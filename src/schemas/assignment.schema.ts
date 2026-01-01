import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

@Schema({ _id: false })
class Question {
  @Prop({ type: String, required: true })
  text!: string;

  @Prop({ type: [String], required: true })
  options!: string[];

  @Prop({ type: String, required: true })
  correctAnswer!: string;

  @Prop({ type: Number, default: 1 })
  points!: number;
}

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ type: String, required: true, index: true })
  courseId!: string;

  @Prop({ type: String, required: true })
  creatorId!: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({
    type: String,
    enum: ['quiz', 'assignment'],
    default: 'quiz',
  })
  type!: 'quiz' | 'assignment';

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: Number, default: 0 })
  totalPoints!: number;

  @Prop({ type: [Question], default: [] })
  questions!: Question[];
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
AssignmentSchema.index({ courseId: 1, createdAt: -1 });
