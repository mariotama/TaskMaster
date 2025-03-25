import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { Equipment } from './entities/equipment.entity';
import { UserEquipment } from './entities/user-equipment.entity';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { AchievementModule } from '../achievement/achievement.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    // Entities for repos
    TypeOrmModule.forFeature([Equipment, UserEquipment]),

    // Use forwardRef for modules to avoid circular dependencies
    forwardRef(() => UserModule),
    forwardRef(() => WalletModule),
    forwardRef(() => AchievementModule),
    forwardRef(() => CommonModule),
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService, TypeOrmModule],
})
export class ShopModule {}
