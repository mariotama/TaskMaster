import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { Achievement } from './entities/achievement.entity';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { TaskModule } from '../task/task.module';
import { ShopModule } from '../shop/shop.module';

@Module({
  imports: [
    // Entities for repos...
    TypeOrmModule.forFeature([Achievement]),

    // Importar módulos necesarios
    UserModule, // user repo
    WalletModule, // WalletService
    forwardRef(() => TaskModule), // Avoid circular dependencies
    forwardRef(() => ShopModule), // Avoid circular dependencies
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService],
})
export class AchievementModule {}
