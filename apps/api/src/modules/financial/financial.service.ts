import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MarkSessionPaidDto } from './dto/mark-session-paid.dto';

@Injectable()
export class FinancialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  /** GET /v1/financial/transactions */
  async list(year?: number, month?: number) {
    const { userId } = this.tenantContext.get()!;
    const where: Record<string, unknown> = { userId };

    if (year && month) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      where.dueDate = { gte: start, lt: end };
    }

    const transactions = await this.prisma.financialTransaction.findMany({
      where,
      orderBy: { dueDate: 'desc' },
    });

    return { data: transactions };
  }

  async create(dto: CreateTransactionDto) {
    const { userId } = this.tenantContext.get()!;
    const transaction = await this.prisma.financialTransaction.create({
      data: { ...dto, userId },
    });
    return { data: transaction };
  }

  /**
   * RF-09: previsão de recebíveis do mês, recalculada em tempo real a partir
   * das sessões agendadas (ainda não realizadas/pagas).
   */
  async receivablesForecast() {
    const { userId } = this.tenantContext.get()!;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const scheduled = await this.prisma.appointment.findMany({
      where: {
        patient: { userId },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        dateTime: { gte: startOfMonth, lt: startOfNextMonth },
      },
      select: { id: true, price: true, patientId: true, patient: { select: { fullName: true } } },
    });

    const total = scheduled.reduce((sum, appointment) => sum + Number(appointment.price), 0);

    return { data: { total, sessions: scheduled } };
  }

  /**
   * RF-10: lançamentos recorrentes no 1º dia do mês (aluguel, supervisão,
   * assinatura PsiFlow etc.). Deve ser disparado por um job agendado (BullMQ)
   * no dia 1 de cada mês; aqui apenas a lógica de replicação dos templates.
   */
  async launchMonthlyRecurring(userId: string) {
    const templates = await this.prisma.financialTransaction.findMany({
      where: { userId, recurring: true },
    });

    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const created = await this.prisma.$transaction(
      templates.map((template) =>
        this.prisma.financialTransaction.create({
          data: {
            userId,
            type: template.type,
            scope: template.scope,
            category: template.category,
            amount: template.amount,
            dueDate,
            recurring: false,
          },
        }),
      ),
    );

    return { data: created };
  }

  /** RF-08: marcar sessão como paga, com reconciliação sugerindo o valor exato. */
  async markSessionPaid(sessionRecordId: string, dto: MarkSessionPaidDto) {
    const sessionRecord = await this.prisma.sessionRecord.findUnique({
      where: { id: sessionRecordId },
    });
    if (!sessionRecord) {
      throw new NotFoundException('SESSION_RECORD_NOT_FOUND');
    }

    const updated = await this.prisma.sessionRecord.update({
      where: { id: sessionRecordId },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: dto.paymentMethod,
        paidAt: new Date(),
      },
    });

    return { data: updated };
  }
}
