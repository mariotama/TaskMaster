import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

/**
 * Unlockable achievements for users
 * Reward for completing tasks
 */
@Entity()
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  icon: string;

  @Column({ default: false })
  isUnlocked: boolean;

  @Column({ nullable: true })
  unlockedAt: Date;

  @ManyToOne(() => User, (user) => user.achievements)
  user: User;
}
