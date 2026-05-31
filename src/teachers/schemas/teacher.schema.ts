import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Teacher extends Document {
  @Prop({ required: true, unique: true })
  identifier: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
