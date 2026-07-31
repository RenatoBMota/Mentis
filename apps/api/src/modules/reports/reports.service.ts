import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** GET /v1/reports/attendance — RF-11: comparecimento por período. */
  async attendance(from: Date, to: Date) {
    const { userId } = this.tenantContext.get()!;

    const appointments = await this.prisma.appointment.groupBy({
      by: ['status'],
      where: { patient: { userId }, dateTime: { gte: from, lte: to } },
      _count: true,
    });

    const total = appointments.reduce((sum, group) => sum + group._count, 0);
    const completed = appointments.find((g) => g.status === 'COMPLETED')?._count ?? 0;

    return {
      data: {
        from,
        to,
        total,
        completed,
        attendanceRate: total > 0 ? completed / total : 0,
        byStatus: appointments,
      },
    };
  }
}
