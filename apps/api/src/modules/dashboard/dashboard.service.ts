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

  /** GET /v1/dashboard/trend — receita e comparecimento por dia, últimos N dias. */
  async trend(days: number) {
    const { userId } = this.tenantContext.get()!;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    const end = new Date(today);
    end.setDate(end.getDate() + 1);

    const appointments = await this.prisma.appointment.findMany({
      where: { patient: { userId }, dateTime: { gte: start, lt: end } },
      select: {
        dateTime: true,
        price: true,
        status: true,
        sessionRecord: { select: { paymentStatus: true } },
      },
    });

    const buckets = new Map<string, { revenue: number; scheduled: number; completed: number }>();
    for (let i = 0; i < days; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      buckets.set(dateKey(day), { revenue: 0, scheduled: 0, completed: 0 });
    }

    for (const appointment of appointments) {
      const bucket = buckets.get(dateKey(appointment.dateTime));
      if (!bucket) continue;
      bucket.scheduled += 1;
      if (appointment.status === 'COMPLETED') bucket.completed += 1;
      if (appointment.sessionRecord?.paymentStatus === 'PAID') {
        bucket.revenue += Number(appointment.price);
      }
    }

    const series = Array.from(buckets.entries()).map(([date, bucket]) => ({ date, ...bucket }));
    return { data: series };
  }
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
