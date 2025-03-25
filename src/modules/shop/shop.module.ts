import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { Equipment } from './entities/equipment.entity';
import { UserEquipment } from './entities/user-equipment.entity';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { AchievementModule } from '../achievement/achievement.module';

@Module({
  imports: [
    // Entities for repos...
    TypeOrmModule.forFeature([Equipment, UserEquipment]),

    // Import necessary modules
    UserModule,
    WalletModule,
    AchievementModule,
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService, TypeOrmModule],
})
export class ShopModule {}
