import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReferralDto {
  /** Ex.: "Exame", "Tratamento", "Encaminhamento para outro profissional", "Outro". */
  @IsString()
  @MaxLength(60)
  type!: string;

  /** Ex.: "Dr. João Silva — Psiquiatra" ou "Laboratório XYZ". */
  @IsOptional()
  @IsString()
  @MaxLength(160)
  recipient?: string;

  @IsString()
  @MinLength(5)
  content!: string;
}
