import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { Achievement } from './entities/achievement.entity';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { TaskModule } from '../task/task.module';
import { ShopModule } from '../shop/shop.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    // Entities for repos
    TypeOrmModule.forFeature([Achievement]),

    // Use forwardRef for modules to avoid circular dependencies
    forwardRef(() => UserModule),
    forwardRef(() => WalletModule),
    forwardRef(() => TaskModule),
    forwardRef(() => ShopModule),
    forwardRef(() => CommonModule),
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService, TypeOrmModule],
})
export class AchievementModule {}
