import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

/**
 * DTO for purchasing equipment
 */
export class PurchaseDto {
  @IsNumber()
  @IsPositive({ message: 'Equipment ID must be valid' })
  @IsNotEmpty({ message: 'Equipment ID is mandatory' })
  equipmentId: number;
}

/**
 * DTO for equipping an item
 */
export class EquipItemDto {
  @IsNumber()
  @IsPositive({ message: 'Equipment ID must be valid' })
  @IsNotEmpty({ message: 'Equipment ID is mandatory' })
  userEquipmentId: number;
}

/**
 * DTO for response
 */
export class UserEquipmentResponseDto {
  id: number;
  isEquipped: boolean;
  acquiredAt: Date;
  userId: number;
  equipment: {
    id: number;
    name: string;
    icon: string;
    type: string;
    rarity: string;
    stats: {
      xpBonus?: number;
      coinBonus?: number;
    };
  };
}
