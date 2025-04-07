import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { TransactionType } from '../../../shared/enums/transaction-type.enum';

/**
 * Registers a financial transaction in the system.
 * Stores information about the transaction amount, description, type (income or expense), and the associated wallet.
 */
@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType; // INCOME, EXPENSE

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;
}
