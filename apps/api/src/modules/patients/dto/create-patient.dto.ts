import { PatientRecurrenceType } from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  fullName!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsString()
  phone!: string;

  @IsEnum(PatientRecurrenceType)
  recurrenceType!: PatientRecurrenceType;

  @IsNumber()
  @Min(0)
  pricePerSession!: number;
}
