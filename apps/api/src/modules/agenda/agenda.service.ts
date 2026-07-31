import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

const SESSION_DURATION_MINUTES = 60;
const RECURRENCE_HORIZON_WEEKS = 8;

@Injectable()
export class AgendaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** GET /v1/agenda/weekly — grade semanal por slots de horário (PRD 9.4). */
  async weekly(weekStart: Date) {
    const { userId } = this.tenantContext.get()!;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        patient: { userId },
        dateTime: { gte: weekStart, lt: weekEnd },
      },
      include: { patient: { select: { id: true, fullName: true } } },
      orderBy: { dateTime: 'asc' },
    });

    return { data: appointments };
  }

  /** POST /v1/agenda/appointments — click-to-create em até 30s (RF-03). */
  async create(dto: CreateAppointmentDto) {
    await this.assertNoConflict(dto.patientId, new Date(dto.dateTime));

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        dateTime: new Date(dto.dateTime),
        modality: dto.modality,
        price: dto.price,
        seriesId: dto.seriesId,
      },
    });

    return { data: appointment };
  }

  /**
   * RF-04: gera ocorrências futuras para sessões semanais/quinzenais, com até
   * RECURRENCE_HORIZON_WEEKS semanas de antecedência. Deve ser reexecutado
   * periodicamente (job) para renovar o horizonte conforme o tempo avança.
   */
  async generateRecurringOccurrences(patientId: string, intervalWeeks: 1 | 2) {
    const patient = await this.prisma.patient.findFirstOrThrow({ where: { id: patientId } });
    const seriesId = randomUUID();
    const occurrences = Math.floor(RECURRENCE_HORIZON_WEEKS / intervalWeeks);

    const lastAppointment = await this.prisma.appointment.findFirst({
      where: { patientId },
      orderBy: { dateTime: 'desc' },
    });
    const baseDate = lastAppointment?.dateTime ?? new Date();

    const data = Array.from({ length: occurrences }, (_, index) => {
      const dateTime = new Date(baseDate);
      dateTime.setDate(dateTime.getDate() + intervalWeeks * 7 * (index + 1));
      return {
        patientId,
        dateTime,
        modality: 'IN_PERSON' as const,
        price: patient.pricePerSession,
        seriesId,
      };
    });

    await this.prisma.appointment.createMany({ data });
    return { data: { seriesId, created: data.length } };
  }

  private async assertNoConflict(patientId: string, dateTime: Date) {
    const patient = await this.prisma.patient.findFirstOrThrow({ where: { id: patientId } });
    const windowStart = new Date(dateTime.getTime() - SESSION_DURATION_MINUTES * 60_000);
    const windowEnd = new Date(dateTime.getTime() + SESSION_DURATION_MINUTES * 60_000);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        patient: { userId: patient.userId },
        status: { notIn: ['CANCELED'] },
        dateTime: { gt: windowStart, lt: windowEnd },
      },
    });

    if (conflict) {
      throw new ConflictException('APPOINTMENT_TIME_CONFLICT');
    }
  }
}
