import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type AssessmentDocument = Assessment & Document;

@Schema({ timestamps: true })
export class Assessment {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Topic', required: false })
  topicId?: Types.ObjectId;

  @Prop({ default: false })
  isCumulative: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Question' }], default: [] })
  cumulativeQuestionIds: Types.ObjectId[];

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

  // Solo requerido para exámenes no acumulativos: el $sample aleatorio de preguntas
  // (assessment-attempts.service.ts) usa este valor. Los acumulativos usan
  // cumulativeQuestionIds en su lugar y el frontend nunca manda este campo para ellos.
  @Prop({
    required: [
      function (this: Assessment) { return !this.isCumulative; },
      'totalQuestionsToPull is required for non-cumulative assessments',
    ],
  })
  totalQuestionsToPull?: number;

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

  @Prop({ default: 0 })
  flashcardsTimeLimitMinutes: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  flashcardUsers: Types.ObjectId[];

  @Prop({ default: false })
  isArchived: boolean;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
