import { Module, forwardRef } from '@nestjs/common';
import { ProgressionService } from './progression/progression.service';
import { NotificationService } from './notification/notification.service';
import { UserModule } from '../modules/user/user.module';
import { ShopModule } from '../modules/shop/shop.module';
import { WalletModule } from '../modules/wallet/wallet.module';
import { AchievementModule } from '../modules/achievement/achievement.module';

@Module({
  imports: [
    // Avoid circular dependencies
    forwardRef(() => UserModule),
    forwardRef(() => ShopModule),
    forwardRef(() => WalletModule),
    forwardRef(() => AchievementModule),
  ],
  providers: [ProgressionService, NotificationService],
  exports: [ProgressionService, NotificationService], // Export services
})
export class CommonModule {}
