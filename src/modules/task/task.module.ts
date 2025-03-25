import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { TaskCompletion } from './entities/task-completion.entity';
import { CommonModule } from '../../common/common.module';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    // Register entities for repos
    TypeOrmModule.forFeature([Task, TaskCompletion]),

    // Necessary modules
    CommonModule, // for ProgressionService
    UserModule, // for acces to User repo
    WalletModule, // for WalletService
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService, TypeOrmModule], // Export taskService and repositories
})
export class TaskModule {}
