import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserSettings } from './entities/user-settings.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    // Register entitys for Repositories
    TypeOrmModule.forFeature([User, UserSettings]),

    // CommonModule to use ProgressionService
    CommonModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule], // Export UserService and repositories
})
export class UserModule {}
