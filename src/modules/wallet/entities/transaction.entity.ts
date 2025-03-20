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
 * Registro de transacciones económicas
 * Documenta cada movimiento financiero, con tipo, cantidad y descripción
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
