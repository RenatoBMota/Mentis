import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { ListSessionsQueryDto } from './dto/list-sessions-query.dto';

/**
 * Une Appointment + SessionRecord numa visão única de "Sessões" — histórico
 * de atendimentos com comparecimento e status de pagamento (PRD 9.7).
 */
@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async list(filters: ListSessionsQueryDto) {
    const { userId } = this.tenantContext.get()!;

    const appointments = await this.prisma.appointment.findMany({
      where: {
        patient: { userId },
        status: filters.status,
        patientId: filters.patientId,
      },
      include: {
        patient: { select: { id: true, fullName: true } },
        sessionRecord: true,
      },
      orderBy: { dateTime: 'desc' },
    });

    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    const noShow = appointments.filter((a) => a.status === 'NO_SHOW').length;
    const relevant = completed + noShow;

    return {
      data: appointments,
      meta: {
        total: appointments.length,
        completed,
        noShow,
        attendanceRate: relevant > 0 ? completed / relevant : null,
      },
    };
  }

  /**
   * PATCH /v1/sessions/:appointmentId/complete — marca a sessão como
   * realizada e gera o SessionRecord correspondente (Pendente de pagamento),
   * se ainda não existir. Um Appointment gera no máximo um SessionRecord
   * (PRD 6.3).
   */
  async complete(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { sessionRecord: true },
    });
    if (!appointment) {
      throw new NotFoundException('APPOINTMENT_NOT_FOUND');
    }

    const [updatedAppointment, sessionRecord] = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' },
      });

      const record =
        appointment.sessionRecord ??
        (await tx.sessionRecord.create({
          data: {
            appointmentId,
            patientId: appointment.patientId,
            date: appointment.dateTime,
            paymentStatus: 'PENDING',
          },
        }));

      return [updated, record] as const;
    });

    return { data: { appointment: updatedAppointment, sessionRecord } };
  }
}
