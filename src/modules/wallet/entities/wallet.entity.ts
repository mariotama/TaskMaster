import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Transaction } from './transaction.entity';

/**
 * Virtual user wallet
 * Handles coins and transactions
 */
@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  coins: number;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn()
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];
}
