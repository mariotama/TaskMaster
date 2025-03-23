import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import {
  TransactionResponseDto,
  WalletResponseDto,
} from './dto/transaction.dto';
import { TransactionType } from 'src/shared/enums/transaction-type.enum';

/**
 * Service to handle virtual economy
 * Handles coins, transactions and user balance
 */
@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Obtains user wallet
   * @param userId user id
   * @returns user wallet
   */
  async getWallet(userId: number): Promise<WalletResponseDto> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      id: wallet.id,
      coins: wallet.coins,
      userId,
    };
  }

  /**
   * Add coins to wallet
   * @param userId user id
   * @param amount coin amount to add
   * @param description transaction description
   * @returns updated wallet
   */
  async addCoins(
    userId: number,
    amount: number,
    description: string,
  ): Promise<WalletResponseDto> {
    // Validate positive amount
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Obtain wallet
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Update balance
    wallet.coins += amount;
    await this.walletRepository.save(wallet);

    // Register transaction
    await this.createTransaction(
      wallet.id,
      amount,
      description,
      TransactionType.INCOME,
    );

    return {
      id: wallet.id,
      coins: wallet.coins,
      userId,
    };
  }

  /**
   * Removes coins to wallet
   * @param userId user id
   * @param amount coin amount to add
   * @param description transaction description
   * @returns updated wallet
   */
  async removeCoins(
    userId: number,
    amount: number,
    description: string,
  ): Promise<WalletResponseDto> {
    // Validate positive amount
    if (amount <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor que cero');
    }

    // Obtain wallet
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      throw new NotFoundException('Billetera no encontrada');
    }

    // Verify enough coins
    if (wallet.coins < amount) {
      throw new BadRequestException('Fondos insuficientes');
    }

    // Update balance
    wallet.coins -= amount;
    await this.walletRepository.save(wallet);

    // Register transaction
    await this.createTransaction(
      wallet.id,
      amount,
      description,
      TransactionType.EXPENSE,
    );

    return {
      id: wallet.id,
      coins: wallet.coins,
      userId,
    };
  }

  /**
   * Obtains the user transaction history
   * @param userId user id
   * @param page page number for pagination
   * @param limit elements per pare limit
   * @returns paged transactions
   */
  async getTransactionHistory(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<{ transactions: TransactionResponseDto[]; total: number }> {
    // Obtain wallet
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      throw new NotFoundException('Billetera no encontrada');
    }

    // Search paged transactions
    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: { wallet: { id: wallet.id } },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    return {
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        createdAt: transaction.createdAt,
      })),
      total,
    };
  }

  /**
   * Creates new transaction
   * @param walletId
   * @param amount
   * @param description
   * @param type (INCOME or EXPENSE)
   * @returns created transaction
   */
  private async createTransaction(
    walletId: number,
    amount: number,
    description: string,
    type: TransactionType,
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      amount,
      description,
      type,
      wallet: { id: walletId },
    });

    return this.transactionRepository.save(transaction);
  }

  /**
   * Inicialize wallet for a new user
   * @param userId user id
   * @returns inicialized wallet
   */
  async initializeWallet(userId: number): Promise<Wallet> {
    // Verify if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Create wallet with initial balance
    const wallet = this.walletRepository.create({
      coins: 100, // Initial coins
      user: { id: userId },
    });

    return this.walletRepository.save(wallet);
  }

  /**
   * Verify if a user has enough coins
   * @param userId user id
   * @param amount amount to verify
   * @returns true if the wallet has enough coins, false if not
   */
  async hasSufficientFunds(userId: number, amount: number): Promise<boolean> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet.coins >= amount;
  }
}
