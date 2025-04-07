import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Task } from '../../task/entities/task.entity';
import { Achievement } from '../../achievement/entities/achievement.entity';
import { UserEquipment } from '../../shop/entities/user-equipment.entity';
import { UserSettings } from './user-settings.entity';

/**
 * Main user entity
 * Stores all the information about the user
 * including their wallet, tasks, achievements, and settings.
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  currentXp: number;

  @Column({ default: 100 })
  xpToNextLevel: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relaciones
  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet: Wallet;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => Achievement, (achievement) => achievement.user)
  achievements: Achievement[];

  @OneToMany(() => UserEquipment, (userEquipment) => userEquipment.user)
  userEquipments: UserEquipment[];

  @OneToOne(() => UserSettings, (settings) => settings.user, { cascade: true })
  settings: UserSettings;
}
