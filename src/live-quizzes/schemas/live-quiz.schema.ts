import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export enum LiveQuizStatus {
  DRAFT = 'draft',
  LOBBY = 'lobby',
  IN_PROGRESS = 'in-progress',
  BETWEEN_QUESTIONS = 'between-questions',
  PODIUM = 'podium',
  FINISHED = 'finished',
}

@Schema({ _id: false })
export class LiveQuizQuestion {
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

  @Prop({ required: true, default: 1 })
  points: number;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: true, default: 30 })
  timeLimitSeconds: number;
}

@Schema({ _id: false })
export class LiveQuizParticipant {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  totalScore: number;

  @Prop({ default: 0 })
  correctAnswers: number;

  @Prop({ default: 0 })
  totalResponseTimeMs: number;

  @Prop({ default: 0 })
  currentStreak: number;
}

@Schema({ _id: false })
export class LiveQuizAnswer {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  questionIndex: number;

  @Prop({ type: [String], required: true })
  answers: string[];

  @Prop({ required: true })
  responseTimeMs: number;

  @Prop({ required: true })
  isCorrect: boolean;

  @Prop({ required: true, default: 0 })
  pointsAwarded: number;
}

@Schema({ timestamps: true })
export class LiveQuiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, unique: true })
  pin: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Group' }], default: [] })
  groupIds: Types.ObjectId[];

  @Prop({ required: true, enum: LiveQuizStatus, default: LiveQuizStatus.DRAFT })
  status: LiveQuizStatus;

  @Prop({ type: [LiveQuizQuestion], required: true })
  questions: LiveQuizQuestion[];

  @Prop({ type: [LiveQuizParticipant], default: [] })
  participants: LiveQuizParticipant[];

  @Prop({ type: [LiveQuizAnswer], default: [] })
  answers: LiveQuizAnswer[];

  @Prop({ default: -1 })
  currentQuestionIndex: number;

  @Prop()
  startedAt?: Date;

  @Prop()
  finishedAt?: Date;
}

export const LiveQuizSchema = SchemaFactory.createForClass(LiveQuiz);
