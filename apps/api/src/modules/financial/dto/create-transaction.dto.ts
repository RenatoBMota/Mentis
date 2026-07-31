import {
  FinancialScope,
  FinancialTransactionType,
} from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(FinancialTransactionType)
  type!: FinancialTransactionType;

  @IsEnum(FinancialScope)
  scope!: FinancialScope;

  @IsString()
  category!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsBoolean()
  recurring?: boolean;
}
