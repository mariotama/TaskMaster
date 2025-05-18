import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { setupSwagger } from './common/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:4200',
      process.env.FRONTEND_URL || '*',
      /\.railway\.app$/,
      /\.vercel\.app$/,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix for api
  app.setGlobalPrefix('api/v1');

  // Global pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters for exceptions
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Config Swagger for documentation
  setupSwagger(app);

  // Init server
  const port = process.env.PORT || configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
