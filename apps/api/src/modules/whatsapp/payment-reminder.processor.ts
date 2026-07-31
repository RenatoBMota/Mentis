import { Inject, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { WHATSAPP_GATEWAY, WhatsAppGateway } from './whatsapp-gateway.interface';
import { PAYMENT_REMINDER_QUEUE, PaymentReminderJobData } from './payment-reminder.queue';

/**
 * RF-07: 48h após o disparo da cobrança, se a sessão ainda não foi paga,
 * envia um lembrete automático via WhatsApp.
 */
@Processor(PAYMENT_REMINDER_QUEUE)
export class PaymentReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentReminderProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(WHATSAPP_GATEWAY) private readonly gateway: WhatsAppGateway,
  ) {
    super();
  }

  async process(job: Job<PaymentReminderJobData>): Promise<void> {
    const { sessionRecordId } = job.data;

    const sessionRecord = await this.prisma.sessionRecord.findUnique({
      where: { id: sessionRecordId },
      include: { patient: true, appointment: true },
    });

    if (!sessionRecord) {
      this.logger.warn(`Lembrete ignorado: sessionRecord ${sessionRecordId} não existe mais.`);
      return;
    }

    if (sessionRecord.paymentStatus === 'PAID') {
      this.logger.log(`Lembrete ignorado: sessão ${sessionRecordId} já está paga.`);
      return;
    }

    const message = this.buildReminderMessage({
      patientName: sessionRecord.patient.fullName,
      amount: sessionRecord.appointment.price.toString(),
      sessionDate: sessionRecord.date,
    });

    const { providerMessageId } = await this.gateway.sendMessage(sessionRecord.patient.phone, message);

    await this.prisma.$transaction([
      this.prisma.sessionRecord.update({
        where: { id: sessionRecordId },
        data: { paymentStatus: 'OVERDUE' },
      }),
      this.prisma.notification.create({
        data: {
          userId: sessionRecord.patient.userId,
          sessionRecordId,
          channel: 'WHATSAPP',
          type: 'PAYMENT_REMINDER',
          payload: { message, providerMessageId },
          status: 'SENT',
          sentAt: new Date(),
        },
      }),
    ]);
  }

  private buildReminderMessage(params: { patientName: string; amount: string; sessionDate: Date }): string {
    const formattedDate = params.sessionDate.toLocaleDateString('pt-BR');
    return [
      `Olá, ${params.patientName}! Este é um lembrete amigável 🙂`,
      `A cobrança referente à sessão de ${formattedDate} (R$ ${params.amount}) ainda consta em aberto.`,
      `Qualquer dúvida, é só responder esta mensagem.`,
    ].join('\n');
  }
}
