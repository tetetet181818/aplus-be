import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssignmentSubmissionDocument = AssignmentSubmission & Document;

@Schema({ _id: false })
class Answer {
  @Prop({ type: Number, required: true })
  questionIndex!: number;

  @Prop({ type: String, required: true })
  answer!: string;
}

@Schema({ timestamps: true })
export class AssignmentSubmission {
  @Prop({ type: String, required: true, index: true })
  assignmentId!: string;

  @Prop({ type: String, required: true, index: true })
  studentId!: string;

  @Prop({ type: [Answer], required: true })
  answers!: Answer[];

  @Prop({ type: Number, required: true })
  score!: number;

  @Prop({ type: Date, default: Date.now })
  submittedAt!: Date;
}

export const AssignmentSubmissionSchema =
  SchemaFactory.createForClass(AssignmentSubmission);
AssignmentSubmissionSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true },
);
