import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import {
  TransactionResponseDto,
  WalletResponseDto,
} from './dto/transaction.dto';
import { TransactionType } from 'src/shared/enums/transaction-type.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Controller to handle wallet and transactions
 * Handles checking coins and transaction historic
 */
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**Obtains wallet from actual user
   * @param user actual user
   * @returns wallet with coins
   */
  @Get()
  async getWallet(@CurrentUser() user: User): Promise<WalletResponseDto> {
    return this.walletService.getWallet(user.id);
  }

  /**
   * Obtains transaction historic
   * @param user actual user
   * @param page numpage
   * @param limit elements epr page
   * @returns transaction historic paged
   */
  @Get('transactions')
  async getTransactionHistory(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ): Promise<{ transactions: TransactionResponseDto[]; total: number }> {
    return this.walletService.getTransactionHistory(user.id, page, limit);
  }

  /**
   * Obtains economic activity summary
   * @param user actual user
   * @returns economic summary
   */
  @Get('summary')
  async getWalletSummary(@CurrentUser() user: User): Promise<any> {
    // Obtains wallet
    const wallet = await this.walletService.getWallet(user.id);

    // Las 5 user transactions
    const { transactions } = await this.walletService.getTransactionHistory(
      user.id,
      1,
      5,
    );

    // Calculate incomes and outcomes (simple implementation)
    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.INCOME) {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
    }

    return {
      currentBalance: wallet.coins,
      recentTransactions: transactions,
      summary: {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
      },
    };
  }
}
