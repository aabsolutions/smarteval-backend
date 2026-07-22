import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // FUNDAMENTAL: Detrás de un proxy como Render, necesitamos esto para que 
  // express lea la IP real del cliente (X-Forwarded-For) y no la del Load Balancer.
  app.set('trust proxy', 1);

  app.use(helmet());

  // Prefijo global de la API — coincide con el proxy del frontend (/api)
  app.setGlobalPrefix('api');

  // CORS: allowlist desde ALLOWED_ORIGINS (coma-separado). Default solo cubre el front en dev.
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:4200').split(',');
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // ValidationPipe global:
  //   whitelist: true  → ignora propiedades no declaradas en el DTO
  //   transform: true  → transforma payloads al tipo del DTO automáticamente
  //   forbidNonWhitelisted: true → lanza error si se reciben propiedades extra
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Filtro global de excepciones HTTP
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`NestJS backend corriendo en puerto: ${port}`);
}

bootstrap();
