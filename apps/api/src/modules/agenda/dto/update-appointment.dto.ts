import { AppointmentModality } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * patientId e seriesId propositalmente de fora — trocar o paciente de um
 * agendamento existente não é suportado (crie um novo agendamento nesse
 * caso); a série de recorrência também não muda por aqui.
 */
export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  dateTime?: string;

  @IsOptional()
  @IsEnum(AppointmentModality)
  modality?: AppointmentModality;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
