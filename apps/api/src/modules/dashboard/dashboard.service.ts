import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';

/** GET /v1/dashboard/summary — métricas do dia (PRD 7.1, 9.3). */
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async summary() {
    const { userId } = this.tenantContext.get()!;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [appointmentsToday, activePatients, paidAppointmentsThisMonth, pendingSessions] =
      await Promise.all([
        this.prisma.appointment.count({
          where: {
            patient: { userId },
            dateTime: { gte: startOfDay, lt: endOfDay },
          },
        }),
        this.prisma.patient.count({
          where: { userId, status: 'ACTIVE', deletedAt: null },
        }),
        this.prisma.appointment.aggregate({
          _sum: { price: true },
          where: {
            patient: { userId },
            sessionRecord: { paymentStatus: 'PAID' },
            dateTime: { gte: startOfMonth, lt: startOfNextMonth },
          },
        }),
        this.prisma.sessionRecord.count({
          where: { patient: { userId }, paymentStatus: { in: ['PENDING', 'OVERDUE'] } },
        }),
      ]);

    return {
      data: {
        appointmentsToday,
        activePatients,
        pendingSessions,
        monthRevenue: paidAppointmentsThisMonth._sum.price ?? 0,
      },
    };
  }
}
