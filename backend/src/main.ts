// Load environment variables FIRST
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Logistics Company API')
    .setDescription('List of API endpoints for the Logistics Company application')
    .setVersion('1.0')
    .addTag('logistics-company')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
