import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Student extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  identifier: string;

  @Prop({ unique: true, index: true, sparse: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Group', required: true })
  groupId: MongooseSchema.Types.ObjectId;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
