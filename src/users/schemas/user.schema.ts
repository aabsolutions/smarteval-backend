import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Role {
  @Prop({ required: true, enum: ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] })
  name: string;

  @Prop({ required: true })
  priority: number;
}

const RoleSchema = SchemaFactory.createForClass(Role);

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true })
  password?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, index: true, sparse: true })
  email: string;

  @Prop({ type: [RoleSchema], required: true })
  roles: Role[];

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: 'default.jpg' })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
