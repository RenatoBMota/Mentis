import { Injectable, NotFoundException } from '@nestjs/common';
import { MedicalRecord, Tag } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { CryptoService } from '../../common/crypto/crypto.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { MedicalRecordPdfService } from './medical-record-pdf.service';

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
    private readonly pdf: MedicalRecordPdfService,
  ) {}

  private decryptRecord<T extends MedicalRecord>(record: T): T {
    return {
      ...record,
      evolutionText: this.crypto.decrypt(record.evolutionText),
      stepsText: this.crypto.decryptOptional(record.stepsText) ?? null,
    };
  }

  /** Achata o join MedicalRecordTag[] em Tag[] para o formato exposto pela API. */
  private withFlatTags<T extends MedicalRecord & { tags: { tag: Tag }[] }>(record: T) {
    return { ...record, tags: record.tags.map((join) => join.tag) };
  }

  /** GET /v1/medical-records/:patientId — linha do tempo de evolução. */
  async findByPatient(patientId: string) {
    const records = await this.prisma.medicalRecord.findMany({
      where: { patientId },
      include: { tags: { include: { tag: true } } },
      orderBy: { sessionNumber: 'asc' },
    });
    return {
      data: records.map((record) => this.withFlatTags(this.decryptRecord(record))),
    };
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

    const recordId = await this.prisma.$transaction(async (tx) => {
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

      for (const tagName of dto.tags ?? []) {
        const tag = await tx.tag.upsert({
          where: { tenantId_name: { tenantId, name: tagName } },
          create: { tenantId, name: tagName },
          update: {},
        });
        await tx.medicalRecordTag.create({
          data: { medicalRecordId: created.id, tagId: tag.id },
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: userId,
          entity: 'MedicalRecord',
          entityId: created.id,
          action: previousVersion ? 'UPDATE' : 'CREATE',
        },
      });

      return created.id;
    });

    const record = await this.prisma.medicalRecord.findUniqueOrThrow({
      where: { id: recordId },
      include: { tags: { include: { tag: true } } },
    });

    return { data: this.withFlatTags(this.decryptRecord(record)) };
  }

  /**
   * POST /v1/medical-records/:patientId/export-pdf — RF-06: PDF com marca
   * d'água (profissional, CRP, data/hora), registrado em AuditLog com a
   * justificativa informada pelo usuário.
   */
  async exportPdf(patientId: string, reason: string): Promise<{ filename: string; buffer: Buffer }> {
    const { tenantId, userId } = this.tenantContext.get()!;

    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
      include: { professional: true },
    });
    if (!patient) {
      throw new NotFoundException('PATIENT_NOT_FOUND');
    }

    const allRecords = await this.prisma.medicalRecord.findMany({
      where: { patientId },
      include: { tags: { include: { tag: true } } },
      orderBy: [{ sessionNumber: 'asc' }, { version: 'desc' }],
    });

    // O documento oficial exporta apenas a versão vigente de cada sessão;
    // o histórico completo de edições permanece disponível via AuditLog.
    const latestBySession = new Map<number, (typeof allRecords)[number]>();
    for (const record of allRecords) {
      if (!latestBySession.has(record.sessionNumber)) {
        latestBySession.set(record.sessionNumber, record);
      }
    }

    const records = Array.from(latestBySession.values())
      .sort((a, b) => a.sessionNumber - b.sessionNumber)
      .map((record) => this.withFlatTags(this.decryptRecord(record)));

    const generatedAt = new Date();

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

    const buffer = await this.pdf.generate({
      patientName: patient.fullName,
      professionalName: patient.professional.name,
      crp: patient.professional.crp,
      generatedAt,
      records,
    });

    const filename = `prontuario-${patient.fullName.replace(/\s+/g, '-').toLowerCase()}-${generatedAt.toISOString().slice(0, 10)}.pdf`;
    return { filename, buffer };
  }
}
