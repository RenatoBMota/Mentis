import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PatientDocument } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { CryptoService } from '../../common/crypto/crypto.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from './document-storage';

const METADATA_SELECT = {
  id: true,
  patientId: true,
  createdById: true,
  category: true,
  title: true,
  description: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  createdAt: true,
} as const;

type DocumentMetadata = Omit<PatientDocument, 'storageKey'>;

/**
 * Biblioteca Digital do paciente: laudos, tarefas de casa e exercícios
 * anexados pelo profissional. O arquivo é criptografado (AES-256-GCM, PRD
 * 11.1) e gravado em UPLOADS_DIR — nunca servido por URL estática, sempre
 * por este endpoint autenticado, no mesmo padrão dos PDFs gerados sob
 * demanda (referrals/medical-records).
 */
@Injectable()
export class DocumentsService {
  private readonly uploadsDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
    private readonly crypto: CryptoService,
    private readonly config: ConfigService,
  ) {
    this.uploadsDir = resolve(this.config.get<string>('UPLOADS_DIR') ?? 'uploads');
  }

  private async requirePatientInTenant(patientId: string): Promise<void> {
    const { tenantId } = this.tenantContext.get()!;
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId, deletedAt: null },
    });
    if (!patient) {
      throw new NotFoundException('PATIENT_NOT_FOUND');
    }
  }

  private async findOwnedDocument(patientId: string, documentId: string): Promise<PatientDocument> {
    await this.requirePatientInTenant(patientId);
    const document = await this.prisma.patientDocument.findFirst({
      where: { id: documentId, patientId },
    });
    if (!document) {
      throw new NotFoundException('DOCUMENT_NOT_FOUND');
    }
    return document;
  }

  /** GET /v1/documents/:patientId — mais recentes primeiro. */
  async findByPatient(patientId: string): Promise<{ data: DocumentMetadata[] }> {
    await this.requirePatientInTenant(patientId);
    const documents = await this.prisma.patientDocument.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      select: METADATA_SELECT,
    });
    return { data: documents };
  }

  /** POST /v1/documents/:patientId (multipart/form-data) */
  async upload(patientId: string, file: Express.Multer.File | undefined, dto: UploadDocumentDto) {
    if (!file) {
      throw new BadRequestException('FILE_REQUIRED');
    }
    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('UNSUPPORTED_FILE_TYPE');
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException('FILE_TOO_LARGE');
    }

    await this.requirePatientInTenant(patientId);
    const { tenantId, userId } = this.tenantContext.get()!;

    const storageKey = join(tenantId, patientId, `${randomUUID()}.enc`);
    const absolutePath = join(this.uploadsDir, storageKey);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, this.crypto.encryptBuffer(file.buffer));

    const document = await this.prisma.$transaction(async (tx) => {
      const created = await tx.patientDocument.create({
        data: {
          patientId,
          createdById: userId,
          category: dto.category,
          title: dto.title,
          description: dto.description,
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          storageKey,
        },
        select: METADATA_SELECT,
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: userId,
          entity: 'PatientDocument',
          entityId: created.id,
          action: 'CREATE',
        },
      });

      return created;
    });

    return { data: document };
  }

  /** GET /v1/documents/:patientId/:documentId/download */
  async download(
    patientId: string,
    documentId: string,
  ): Promise<{ filename: string; mimeType: string; buffer: Buffer }> {
    const document = await this.findOwnedDocument(patientId, documentId);
    const { tenantId, userId } = this.tenantContext.get()!;

    const encrypted = await readFile(join(this.uploadsDir, document.storageKey));
    const buffer = this.crypto.decryptBuffer(encrypted);

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        actorId: userId,
        entity: 'PatientDocument',
        entityId: document.id,
        action: 'EXPORT',
      },
    });

    return { filename: document.fileName, mimeType: document.mimeType, buffer };
  }

  /** DELETE /v1/documents/:patientId/:documentId */
  async remove(patientId: string, documentId: string): Promise<void> {
    const document = await this.findOwnedDocument(patientId, documentId);
    const { tenantId, userId } = this.tenantContext.get()!;

    await this.prisma.$transaction(async (tx) => {
      await tx.patientDocument.delete({ where: { id: document.id } });
      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: userId,
          entity: 'PatientDocument',
          entityId: document.id,
          action: 'DELETE',
        },
      });
    });

    await unlink(join(this.uploadsDir, document.storageKey)).catch(() => undefined);
  }
}
