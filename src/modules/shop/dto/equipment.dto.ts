import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsPositive,
  Min,
  Max,
  IsObject,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentType } from '../../../shared/enums/equipment-type.enum';
import { Rarity } from '../../../shared/enums/rarity.enum';

/**
 * DTO para las estadísticas de equipamiento
 */
export class EquipmentStatsDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  xpBonus?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  coinBonus?: number;
}

/**
 * DTO para crear nuevos equipamientos en el catálogo
 */
export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del equipamiento es obligatorio' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del equipamiento es obligatoria' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'El ícono del equipamiento es obligatorio' })
  icon: string;

  @IsEnum(EquipmentType, {
    message: 'El tipo debe ser HEAD, BODY, o ACCESSORY',
  })
  @IsNotEmpty({ message: 'El tipo de equipamiento es obligatorio' })
  type: EquipmentType;

  @IsEnum(Rarity, { message: 'La rareza debe ser COMMON, RARE, o EPIC' })
  @IsNotEmpty({ message: 'La rareza del equipamiento es obligatoria' })
  rarity: Rarity;

  @IsNumber()
  @IsPositive({ message: 'El precio debe ser mayor a cero' })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  price: number;

  @IsObject()
  @ValidateNested()
  @Type(() => EquipmentStatsDto)
  @IsNotEmpty({ message: 'Las estadísticas son obligatorias' })
  stats: EquipmentStatsDto;

  @IsNumber()
  @Min(1)
  @IsNotEmpty({ message: 'El nivel requerido es obligatorio' })
  requiredLevel: number;
}

/**
 * DTO para actualizar equipamientos existentes
 */
export class UpdateEquipmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsEnum(EquipmentType)
  @IsOptional()
  type?: EquipmentType;

  @IsEnum(Rarity)
  @IsOptional()
  rarity?: Rarity;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => EquipmentStatsDto)
  @IsOptional()
  stats?: EquipmentStatsDto;

  @IsNumber()
  @Min(1)
  @IsOptional()
  requiredLevel?: number;
}

/**
 * DTO para respuesta con información de equipamiento
 */
export class EquipmentResponseDto {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: EquipmentType;
  rarity: Rarity;
  price: number;
  stats: {
    xpBonus?: number;
    coinBonus?: number;
  };
  requiredLevel: number;
}
