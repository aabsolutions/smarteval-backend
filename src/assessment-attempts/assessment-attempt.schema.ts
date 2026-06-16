import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssessmentAttemptDocument = AssessmentAttempt & Document;

export enum AttemptStatus {
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

@Schema({ _id: false })
class SnapshotQuestion {
  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  statement: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: [String], required: true })
  correctAnswers: string[];

  @Prop({ type: [String] })
  matchingOptions?: string[];

  @Prop({ required: true })
  points: number;

  @Prop({ required: false })
  imageUrl?: string;
}

@Schema({ _id: false })
class StudentAnswer {
  @Prop({ required: true })
  questionId: string;

  @Prop({ type: [String], required: true })
  answers: string[];
}

@Schema({ timestamps: true })
export class AssessmentAttempt {
  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ required: true, enum: AttemptStatus, default: AttemptStatus.IN_PROGRESS })
  status: AttemptStatus;

  @Prop({ type: [SnapshotQuestion], required: true })
  questionsPulled: SnapshotQuestion[];

  @Prop({ type: [StudentAnswer], default: [] })
  studentAnswers: StudentAnswer[];

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  maxScore: number;

  @Prop({ type: Object, default: {} })
  antiCheatLog: {
    tabSwitches?: number;
    fullscreenExits?: number;
    copyPasteAttempts?: number;
    devtoolsAttempts?: number;
  };

  @Prop({ default: false })
  isTimeout: boolean;

  @Prop({ default: false })
  outOfTime: boolean;

  @Prop({ default: false })
  isArchived: boolean;
}

export const AssessmentAttemptSchema = SchemaFactory.createForClass(AssessmentAttempt);
