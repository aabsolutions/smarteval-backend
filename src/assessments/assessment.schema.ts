import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type AssessmentDocument = Assessment & Document;

@Schema({ timestamps: true })
export class Assessment {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Topic', required: true })
  topicId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Group' }], required: true })
  groupIds: Types.ObjectId[];

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  durationMinutes: number;

  @Prop({ required: true })
  totalQuestionsToPull: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  antiCheat: boolean;

  @Prop({ default: false })
  shuffleOptions: boolean;

  @Prop({ required: true, default: 1 })
  maxAttempts: number;

  @Prop({ default: false })
  isSimulator: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  allowedLateStudents: Types.ObjectId[];
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
