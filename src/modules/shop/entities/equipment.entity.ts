import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserEquipment } from './user-equipment.entity';
import { EquipmentType } from '../../../shared/enums/equipment-type.enum';
import { Rarity } from '../../../shared/enums/rarity.enum';

/**
 * Equipment available in the shop
 * Defines items that give bonuses to the user
 */
@Entity()
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  icon: string;

  @Column({ type: 'enum', enum: EquipmentType })
  type: EquipmentType; // HEAD, BODY, ACCESSORY

  @Column({ type: 'enum', enum: Rarity })
  rarity: Rarity; // COMMON, RARE, EPIC

  @Column()
  price: number;

  @Column({ type: 'json' })
  stats: {
    xpBonus?: number;
    coinBonus?: number;
  };

  @Column({ default: 1 })
  requiredLevel: number;

  @OneToMany(() => UserEquipment, (userEquipment) => userEquipment.equipment)
  userEquipments: UserEquipment[];
}
