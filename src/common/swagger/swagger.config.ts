import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Configura Swagger/OpenAPI para documentación de API
 * @param app Instancia de la aplicación NestJS
 */
export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('TaskMaster API')
    .setDescription('API para sistema de gamificación de productividad')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticación')
    .addTag('users', 'Gestión de usuarios')
    .addTag('tasks', 'Gestión de tareas')
    .addTag('wallet', 'Economía virtual')
    .addTag('shop', 'Tienda y equipamiento')
    .addTag('achievements', 'Logros desbloqueables')
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
