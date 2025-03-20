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
 * Registro de tareas completadas
 * Permite seguimiento histórico de completados y estadísticas
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

  @ManyToOne(() => Task, (task) => task.completions)
  task: Task;

  @ManyToOne(() => User)
  user: User;
}
