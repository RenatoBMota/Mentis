import { PartialType } from '@nestjs/mapped-types';
import { PatientStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreatePatientDto } from './create-patient.dto';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsOptional()
  @IsString()
  anamnesis?: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;
}
