import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeachersModule } from '../teachers/teachers.module';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group, GroupSchema } from './schemas/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    TeachersModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
