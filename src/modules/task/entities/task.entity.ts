import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TaskCompletion } from './task-completion.entity';
import { TaskType } from '../../../shared/enums/task-type.enum';

/**
 * Tareas creadas por los usuarios
 * Definen objetivos con recompensas y estado de completitud
 */
@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskType })
  type: TaskType; // DAILY, MISSION

  @Column({ default: false })
  isCompleted: boolean;

  @Column()
  xpReward: number;

  @Column()
  coinReward: number;

  @Column({ nullable: true, type: 'date' })
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;

  @OneToMany(() => TaskCompletion, (completion) => completion.task)
  completions: TaskCompletion[];
}
