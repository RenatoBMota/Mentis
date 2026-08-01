import { Injectable, NotFoundException } from '@nestjs/common';
import { Referral } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { CryptoService } from '../../common/crypto/crypto.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { ReferralPdfService } from './referral-pdf.service';

/**
 * content é criptografado com AES-256-GCM em repouso (PRD 11.1), como o
 * restante do conteúdo clínico. O PDF é sempre gerado sob demanda a partir
 * do registro salvo — nunca armazenado como arquivo em disco.
 */
@Injectable()
export class ReferralsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
    private readonly crypto: CryptoService,
    private readonly pdf: ReferralPdfService,
  ) {}

  private decryptReferral(referral: Referral): Referral {
    return { ...referral, content: this.crypto.decrypt(referral.content) };
  }

  /** GET /v1/referrals/:patientId — encaminhamentos do paciente, mais recentes primeiro. */
  async findByPatient(patientId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: referrals.map((referral) => this.decryptReferral(referral)) };
  }

  /** POST /v1/referrals/:patientId */
  async create(patientId: string, dto: CreateReferralDto) {
    const { tenantId, userId } = this.tenantContext.get()!;

    const referral = await this.prisma.$transaction(async (tx) => {
      const created = await tx.referral.create({
        data: {
          patientId,
          createdById: userId,
          type: dto.type,
          recipient: dto.recipient,
          content: this.crypto.encrypt(dto.content),
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: userId,
          entity: 'Referral',
          entityId: created.id,
          action: 'CREATE',
        },
      });

      return created;
    });

    return { data: this.decryptReferral(referral) };
  }

  /** GET /v1/referrals/:id/pdf — regenera o PDF a partir do registro salvo. */
  async generatePdf(id: string): Promise<{ filename: string; buffer: Buffer }> {
    const { tenantId } = this.tenantContext.get()!;

    const referral = await this.prisma.referral.findFirst({
      where: { id, patient: { tenantId } },
      include: { patient: { include: { professional: true } } },
    });
    if (!referral) {
      throw new NotFoundException('REFERRAL_NOT_FOUND');
    }

    const buffer = await this.pdf.generate({
      referral: this.decryptReferral(referral),
      patientName: referral.patient.fullName,
      patientAge: referral.patient.age,
      professionalName: referral.patient.professional.name,
      crp: referral.patient.professional.crp,
      generatedAt: new Date(),
    });

    const slug = referral.type.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `encaminhamento-${slug}-${referral.patient.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    return { filename, buffer };
  }
}
