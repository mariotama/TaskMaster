import { IsNumber, IsString, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { TransactionType } from '../../../shared/enums/transaction-type.enum';

/**
 * DTO for creating a transaction
 */
export class CreateTransactionDto {
  @IsNumber()
  @Min(1, { message: 'El monto debe ser mayor a cero' })
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @IsEnum(TransactionType, { message: 'El tipo debe ser INCOME o EXPENSE' })
  @IsNotEmpty({ message: 'El tipo de transacción es obligatorio' })
  type: TransactionType;
}

/**
 * DTO for response with wallet information
 */
export class WalletResponseDto {
  id: number;
  coins: number;
  userId: number;
}

/**
 * DTO for response with transaction information
 */
export class TransactionResponseDto {
  id: number;
  amount: number;
  description: string;
  type: TransactionType;
  createdAt: Date;
}
