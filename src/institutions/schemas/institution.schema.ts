import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Institution extends Document {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ required: false })
  logoUrl?: string;

  @Prop({ required: false })
  coverUrl?: string;

  @Prop({ required: false })
  reportIdentification?: string;
}

export const InstitutionSchema = SchemaFactory.createForClass(Institution);
