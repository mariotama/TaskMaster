import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressionService } from './progression/progression.service';
import { NotificationService } from './notification/notification.service';
import { User } from '../modules/user/entities/user.entity';
import { UserEquipment } from '../modules/shop/entities/user-equipment.entity';
import { TaskCompletion } from '../modules/task/entities/task-completion.entity';
import { Achievement } from '../modules/achievement/entities/achievement.entity';
import { UserModule } from '../modules/user/user.module';
import { WalletModule } from '../modules/wallet/wallet.module';
import { AchievementModule } from '../modules/achievement/achievement.module';
import { ShopModule } from '../modules/shop/shop.module';
import { TaskModule } from '../modules/task/task.module';

@Module({
  imports: [
    // Register required entities
    TypeOrmModule.forFeature([
      User,
      UserEquipment,
      TaskCompletion,
      Achievement,
    ]),

    // Import necessary modules to resolve dependencies
    forwardRef(() => UserModule),
    forwardRef(() => WalletModule),
    forwardRef(() => AchievementModule),
    forwardRef(() => ShopModule),
    forwardRef(() => TaskModule),
  ],
  providers: [ProgressionService, NotificationService],
  exports: [
    ProgressionService,
    NotificationService,
    TypeOrmModule, // Export TypeOrmModule for entity repositories
  ],
})
export class CommonModule {}
