import { BadRequestException, Injectable } from '@nestjs/common';
import { Assessment } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { CryptoService } from '../../common/crypto/crypto.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import {
  computeTotalScore,
  hasClinicalAlert,
  severityLabel,
  severityTone,
  validateAnswers,
} from './assessment-scoring';

export interface AssessmentWithScore extends Omit<Assessment, 'answers'> {
  answers: number[];
  severity: string;
  severityTone: 'success' | 'warning' | 'danger';
  clinicalAlert: boolean;
}

/**
 * answers é criptografado em repouso (PRD 11.1), como o restante do
 * conteúdo clínico. totalScore fica em claro para permitir consultar o
 * histórico/gráfico de tendência sem descriptografar cada registro.
 */
@Injectable()
export class AssessmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
    private readonly crypto: CryptoService,
  ) {}

  private toAssessmentWithScore(assessment: Assessment): AssessmentWithScore {
    const answers: number[] = JSON.parse(this.crypto.decrypt(assessment.answers));
    return {
      ...assessment,
      answers,
      severity: severityLabel(assessment.type, assessment.totalScore),
      severityTone: severityTone(assessment.type, assessment.totalScore),
      clinicalAlert: hasClinicalAlert(assessment.type, answers),
    };
  }

  /** GET /v1/assessments/:patientId — histórico, mais recente primeiro. */
  async findByPatient(patientId: string) {
    const assessments = await this.prisma.assessment.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: assessments.map((a) => this.toAssessmentWithScore(a)) };
  }

  /** POST /v1/assessments/:patientId */
  async create(patientId: string, dto: CreateAssessmentDto) {
    const { tenantId, userId } = this.tenantContext.get()!;

    try {
      validateAnswers(dto.type, dto.answers);
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }

    const totalScore = computeTotalScore(dto.type, dto.answers);

    const assessment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.assessment.create({
        data: {
          patientId,
          createdById: userId,
          type: dto.type,
          answers: this.crypto.encrypt(JSON.stringify(dto.answers)),
          totalScore,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: userId,
          entity: 'Assessment',
          entityId: created.id,
          action: 'CREATE',
        },
      });

      return created;
    });

    return { data: this.toAssessmentWithScore(assessment) };
  }
}
