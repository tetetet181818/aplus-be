import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

export interface CourseLesson {
  _id: string;
  queueNumber: number;
  url: string;
  title: string;
  status: 'published' | 'unpublished';
}

export interface CourseModule {
  _id: string;
  title: string;
  queueNumber: number;
  lessons: CourseLesson[];
}

@Schema({ timestamps: true })
export class Course {
  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({ type: String, required: true })
  thumbnail!: string;

  @Prop({ type: Number, required: true })
  price!: number;

  @Prop({ type: String, required: true })
  ownerId!: string;

  @Prop({ type: String, required: true })
  ownerName!: string;

  @Prop({ type: String, required: true })
  ownerEmail!: string;

  @Prop({ type: String, required: true })
  ownerPhone!: string;

  @Prop({
    type: [
      {
        _id: { type: String, required: true },
        title: { type: String, required: true },
        queueNumber: { type: Number, required: true },
        lessons: {
          type: [
            {
              _id: { type: String, required: true },
              queueNumber: { type: Number, required: true },
              url: { type: String, required: true },
              title: { type: String, required: true },
              status: {
                type: String,
                enum: ['published', 'unpublished'],
                default: 'unpublished',
              },
            },
          ],
          default: [],
        },
      },
    ],
    required: false,
    default: [],
  })
  modules!: CourseModule[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
