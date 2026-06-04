import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LateRequestDocument = LateRequest & Document;

export enum LateRequestStatus {
  RECIBIDA = 'RECIBIDA',
  REVISANDO = 'REVISANDO',
  DEVUELTA = 'DEVUELTA',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  ANULADA = 'ANULADA',
}

@Schema({ timestamps: true })
export class LateRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  teacherId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Assessment', required: true })
  assessmentId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ type: [String], default: [] })
  imagePublicIds: string[];

  @Prop({ required: true, enum: LateRequestStatus, default: LateRequestStatus.RECIBIDA })
  status: string;

  @Prop()
  teacherComment?: string;

  @Prop()
  extensionUntil?: Date;
}

export const LateRequestSchema = SchemaFactory.createForClass(LateRequest);
