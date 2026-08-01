import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreatePatientDto } from './create-patient.dto';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsOptional()
  @IsString()
  anamnesis?: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;
}
