import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Equipment } from './equipment.entity';

/**
 * Inventario de equipamiento del usuario
 * Relaciona usuarios con equipamiento adquirido y su estado
 */
@Entity()
export class UserEquipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isEquipped: boolean;

  @CreateDateColumn()
  acquiredAt: Date;

  @ManyToOne(() => User, (user) => user.userEquipments)
  user: User;

  @ManyToOne(() => Equipment, (equipment) => equipment.userEquipments)
  equipment: Equipment;
}
