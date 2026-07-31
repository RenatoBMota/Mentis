import { Injectable, NotImplementedException } from '@nestjs/common';
import { MedicalRecord } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { CryptoService } from '../../common/crypto/crypto.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

/**
 * evolutionText/stepsText são criptografados com AES-256-GCM em repouso
 * (PRD 11.1) via CryptoService; nunca chegam em texto plano ao banco.
 */
@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
    private readonly crypto: CryptoService,
  ) {}

  private decryptRecord<T extends MedicalRecord>(record: T): T {
    return {
      ...record,
      evolutionText: this.crypto.decrypt(record.evolutionText),
      stepsText: this.crypto.decryptOptional(record.stepsText) ?? null,
    };
  }

  /** GET /v1/medical-records/:patientId — linha do tempo de evolução. */
  async findByPatient(patientId: string) {
    const records = await this.prisma.medicalRecord.findMany({
      where: { patientId },
      include: { tags: { include: { tag: true } } },
      orderBy: { sessionNumber: 'asc' },
    });
    return { data: records.map((record) => this.decryptRecord(record)) };
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
          evolutionText: this.crypto.encrypt(dto.evolutionText),
          observations: dto.observations,
          stepsText: this.crypto.encryptOptional(dto.stepsText),
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

    return { data: this.decryptRecord(record) };
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
