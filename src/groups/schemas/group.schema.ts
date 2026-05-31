import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Group extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Institution', required: true })
  institution: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['MATUTINA', 'VESPERTINA', 'NOCTURNA', 'VIRTUAL'] })
  jornada: string;

  @Prop({ required: true, enum: ['EGB MEDIA', 'EGB SUPERIOR', 'BACHILLERATO', 'SUPERIOR'] })
  nivel: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Teacher', default: null })
  teacher: MongooseSchema.Types.ObjectId | null;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
