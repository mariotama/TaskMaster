import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

/**
 * DTO para realizar compras de equipamiento
 */
export class PurchaseDto {
  @IsNumber()
  @IsPositive({ message: 'El ID del equipamiento debe ser válido' })
  @IsNotEmpty({ message: 'El ID del equipamiento es obligatorio' })
  equipmentId: number;
}

/**
 * DTO para equipar o desequipar ítems
 */
export class EquipItemDto {
  @IsNumber()
  @IsPositive({ message: 'El ID del equipamiento de usuario debe ser válido' })
  @IsNotEmpty({ message: 'El ID del equipamiento de usuario es obligatorio' })
  userEquipmentId: number;
}

/**
 * DTO para respuesta con información de equipamiento de usuario
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
