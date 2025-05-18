import { webcrypto } from 'node:crypto';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}
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

  // Helmet for HTTP security
  app.use(helmet());

  // CORS for frontend
  app.enableCors({
    //origin: configService.get('FRONTEND_URL', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
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
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`Documentación disponible en: http://localhost:${port}/api/docs`);
}
bootstrap();
