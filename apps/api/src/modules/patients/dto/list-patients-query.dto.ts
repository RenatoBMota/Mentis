import { PatientStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListPatientsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
