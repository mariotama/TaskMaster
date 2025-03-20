import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { AchievementModule } from './achievement/achievement.module';
import { ShopModule } from './shop/shop.module';
import { WalletModule } from './wallet/wallet.module';
import { CommonModule } from './common/common.module';
import { NotificationnestService } from './generate/common/notificationnest/notificationnest.service';
import { CommonModule } from './common/common.module';

@Module({
  imports: [AuthModule, UserModule, TaskModule, AchievementModule, ShopModule, WalletModule, CommonModule],
  controllers: [AppController],
  providers: [AppService, NotificationnestService],
})
export class AppModule {}
