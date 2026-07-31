import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class MarkSessionPaidDto {
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  /** Editável para casos de desconto (RF-08); padrão é o valor exato da sessão. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
