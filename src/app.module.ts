import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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
  ],
})
export class AppModule {}
