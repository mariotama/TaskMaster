import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { UserModule } from '../user/user.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    // Entities for repos
    TypeOrmModule.forFeature([Wallet, Transaction]),

    // Use forwardRef for modules to avoid circular dependencies
    forwardRef(() => UserModule),
    forwardRef(() => CommonModule),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService, TypeOrmModule],
})
export class WalletModule {}
