import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TaskModule } from './modules/task/task.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ShopModule } from './modules/shop/shop.module';
import { AchievementModule } from './modules/achievement/achievement.module';
import { CommonModule } from './common/common.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import * as Joi from 'joi';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // Centralized configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        // Railway PostgreSQL
        DATABASE_URL: Joi.string().optional(),
        // Fallback para desarrollo local
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().default('postgres'),
        DB_PASSWORD: Joi.string().default('postgres'),
        DB_NAME: Joi.string().default('taskmaster'),
        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('1d'),
        // Frontend
        FRONTEND_URL: Joi.string().optional(),
      }),
    }),

    // TypeORM configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const databaseUrl: string | undefined =
          configService.get<string>('DATABASE_URL');

        console.log('🔧 Configuring database...');
        console.log('Environment:', configService.get('NODE_ENV'));
        console.log('Has DATABASE_URL:', !!databaseUrl);

        if (databaseUrl) {
          // Configuración para Railway (production)
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: !isProduction, // Solo en desarrollo
            logging: !isProduction,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
            extra: isProduction
              ? {
                  ssl: {
                    rejectUnauthorized: false,
                  },
                }
              : {},
          };
        } else {
          // Configuración para desarrollo local
          return {
            type: 'postgres' as const,
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>('DB_PASSWORD', 'postgres'),
            database: configService.get<string>('DB_NAME', 'taskmaster'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: true,
          };
        }
      },
    }),

    // App modules
    CommonModule,
    AuthModule,
    UserModule,
    TaskModule,
    WalletModule,
    ShopModule,
    AchievementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply LoggingMiddleware to all routes
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
