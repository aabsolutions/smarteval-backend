import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuestionType {
  SINGLE_CHOICE = 'single-choice',
  MULTIPLE_CHOICE = 'multiple-choice',
  TRUE_FALSE = 'true-false',
  FILL_BLANK = 'fill-blank',
  MATCHING = 'matching',
}

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true, enum: QuestionType, default: QuestionType.SINGLE_CHOICE })
  type: QuestionType;

  @Prop({ required: true })
  statement: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: [String], required: true })
  correctAnswers: string[];

  @Prop({ required: true, default: 1 })
  points: number;

  @Prop({ required: true, enum: QuestionDifficulty, default: QuestionDifficulty.MEDIUM })
  difficulty: QuestionDifficulty;

  @Prop({ type: Types.ObjectId, ref: 'Topic', required: true })
  topicId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: false })
  imagePublicId?: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
