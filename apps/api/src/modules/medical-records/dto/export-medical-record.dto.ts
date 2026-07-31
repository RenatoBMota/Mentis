import { IsString, MinLength } from 'class-validator';

export class ExportMedicalRecordDto {
  /** Justificativa obrigatória, registrada em AuditLog (RF-06). */
  @IsString()
  @MinLength(5)
  reason!: string;
}
