import { AppointmentModality } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  patientId!: string;

  @IsDateString()
  dateTime!: string;

  @IsEnum(AppointmentModality)
  modality!: AppointmentModality;

  @IsNumber()
  @Min(0)
  price!: number;

  /** Presente quando o agendamento faz parte de uma recorrência semanal/quinzenal (RF-04). */
  @IsOptional()
  @IsString()
  seriesId?: string;
}
