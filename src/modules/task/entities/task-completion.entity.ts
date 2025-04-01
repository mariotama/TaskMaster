import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../user/entities/user.entity';

/**
 * Historic of task completions
 * Allows to track the completions of tasks by users
 */
@Entity()
export class TaskCompletion {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  completedAt: Date;

  @Column({ default: 0 })
  xpEarned: number;

  @Column({ default: 0 })
  coinsEarned: number;

  @ManyToOne(() => Task, (task) => task.completions, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'nullify',
  })
  task: Task;

  @ManyToOne(() => User, { nullable: false })
  user: User;
}
