import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Configue Swagger/OpenAPI for API documentation
 * @param app NestJS application instance
 */
export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('TaskMaster API')
    .setDescription('API for the TaskMaster application')
    .setVersion('1.0')
    .addTag('auth', 'Auth endpoints')
    .addTag('users', 'User management')
    .addTag('tasks', 'Task management')
    .addTag('wallet', 'Virtual economy')
    .addTag('shop', 'Store and equipment')
    .addTag('achievements', 'Achievements')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
