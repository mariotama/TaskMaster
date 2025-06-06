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
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement]),

    forwardRef(() => UserModule),
    forwardRef(() => WalletModule),
    forwardRef(() => TaskModule),
    forwardRef(() => ShopModule),
    forwardRef(() => CommonModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService, TypeOrmModule],
})
export class AchievementModule {}
