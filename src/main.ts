import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global de la API — coincide con el proxy del frontend (/api)
  app.setGlobalPrefix('api');

  // CORS: en desarrollo se permite todo; en producción acotar ALLOWED_ORIGINS
  app.enableCors({
    origin: '*',
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
  await app.listen(port);

  console.log(`NestJS backend corriendo en: http://localhost:${port}/api`);
}

bootstrap();
