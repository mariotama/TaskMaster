import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: true })
  enableNotifications: boolean;

  @OneToOne(() => User, (user) => user.settings)
  @JoinColumn()
  user: User;

  @Column({ default: 'UTC' })
  timezone: string;
}
