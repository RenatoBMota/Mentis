import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

/**
 * TODO(seção 11.1): evolutionText/stepsText devem ser criptografados com
 * AES-256 em repouso antes de persistir (ex.: envelope encryption via KMS +
 * pgcrypto, ou criptografia a nível de aplicação no PrismaService). Ainda não
 * implementado neste scaffold inicial — não armazenar dados reais de pacientes
 * até essa etapa ser concluída.
 */
@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** GET /v1/medical-records/:patientId — linha do tempo de evolução. */
  async findByPatient(patientId: string) {
    const records = await this.prisma.medicalRecord.findMany({
      where: { patientId },
      include: { tags: { include: { tag: true } } },
      orderBy: { sessionNumber: 'asc' },
    });
    return { data: records };
  }

  /**
   * POST /v1/medical-records/:patientId — RF-05: evolução salva é imutável;
   * uma nova escrita para a mesma sessão cria uma nova versão auditada, nunca
   * sobrescreve a original.
   */
  async create(patientId: string, dto: CreateMedicalRecordDto) {
    const { tenantId, userId } = this.tenantContext.get()!;

    const previousVersion = await this.prisma.medicalRecord.findFirst({
      where: { patientId, sessionNumber: dto.sessionNumber },
      orderBy: { version: 'desc' },
    });

    const record = await this.prisma.$transaction(async (tx) => {
      const created = await tx.medicalRecord.create({
        data: {
          patientId,
          sessionNumber: dto.sessionNumber,
          evolutionText: dto.evolutionText,
          observations: dto.observations,
          stepsText: dto.stepsText,
          createdById: userId,
          version: (previousVersion?.version ?? 0) + 1,
          supersedesId: previousVersion?.id,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: userId,
          entity: 'MedicalRecord',
          entityId: created.id,
          action: previousVersion ? 'UPDATE' : 'CREATE',
        },
      });

      return created;
    });

    return { data: record };
  }

  /** POST /v1/medical-records/:patientId/export-pdf — RF-06. */
  async exportPdf(patientId: string, reason: string) {
    const { tenantId, userId } = this.tenantContext.get()!;

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        actorId: userId,
        entity: 'MedicalRecord',
        entityId: patientId,
        action: 'EXPORT',
        reason,
      },
    });

    // TODO: gerar PDF com marca d'água (profissional, CRP, data/hora) — PRD 8.3/RF-06.
    throw new NotImplementedException('PDF_EXPORT_NOT_IMPLEMENTED');
  }
}
