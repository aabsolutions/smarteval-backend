import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { StudentsModule } from './students/students.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionsModule } from './questions/questions.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { AssessmentAttemptsModule } from './assessment-attempts/assessment-attempts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { TeachersModule } from './teachers/teachers.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { LateRequestsModule } from './late-requests/late-requests.module';

@Module({
  imports: [
    // Carga las variables de entorno desde .env de forma global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Conexión a MongoDB usando la URI del ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        // Pool optimizado para un servidor de larga duración (OLTP)
        maxPoolSize: 20,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
    }),

    // Rate limiting global: 20 requests / 60s por IP salvo overrides puntuales (ej. login)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),

    AuthModule,
    UsersModule,
    GroupsModule,
    StudentsModule,
    TopicsModule,
    QuestionsModule,
    AssessmentsModule,
    AssessmentAttemptsModule,
    NotificationsModule,
    InstitutionsModule,
    TeachersModule,
    CloudinaryModule,
    LateRequestsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
