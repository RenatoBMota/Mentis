import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsInt()
  @Min(1)
  sessionNumber!: number;

  @IsString()
  evolutionText!: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  stepsText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
