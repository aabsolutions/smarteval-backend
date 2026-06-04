import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LateRequestsService } from './late-requests.service';
import { LateRequestsController } from './late-requests.controller';
import { LateRequest, LateRequestSchema } from './late-request.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AssessmentsModule } from '../assessments/assessments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LateRequest.name, schema: LateRequestSchema }]),
    CloudinaryModule,
    NotificationsModule,
    AssessmentsModule
  ],
  controllers: [LateRequestsController],
  providers: [LateRequestsService],
})
export class LateRequestsModule {}
