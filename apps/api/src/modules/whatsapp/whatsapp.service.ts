import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WHATSAPP_GATEWAY, WhatsAppGateway } from './whatsapp-gateway.interface';

const PAYMENT_REMINDER_DELAY_HOURS = 48;

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WHATSAPP_GATEWAY) private readonly gateway: WhatsAppGateway,
  ) {}

  /**
   * POST /v1/whatsapp/send-charge-link — RF-07: mensagem formatada com nome,
   * valor exato, data da sessão e chave Pix, disparada em 1 clique.
   */
  async sendChargeLink(sessionRecordId: string) {
    const sessionRecord = await this.prisma.sessionRecord.findUnique({
      where: { id: sessionRecordId },
      include: { patient: { include: { professional: true } }, appointment: true },
    });
    if (!sessionRecord) {
      throw new NotFoundException('SESSION_RECORD_NOT_FOUND');
    }

    const { patient, appointment } = sessionRecord;
    const message = this.buildChargeMessage({
      patientName: patient.fullName,
      amount: appointment.price.toString(),
      sessionDate: sessionRecord.date,
      pixKey: patient.professional.pixKey ?? '(chave Pix não cadastrada)',
    });

    const { providerMessageId } = await this.gateway.sendMessage(patient.phone, message);

    const [, notification] = await this.prisma.$transaction([
      this.prisma.sessionRecord.update({
        where: { id: sessionRecordId },
        data: { chargeSentAt: new Date() },
      }),
      this.prisma.notification.create({
        data: {
          userId: patient.userId,
          sessionRecordId,
          channel: 'WHATSAPP',
          type: 'CHARGE',
          payload: { message, providerMessageId },
          status: 'SENT',
          sentAt: new Date(),
        },
      }),
    ]);

    // TODO: enfileirar lembrete de 48h via BullMQ (Redis) — RF-07.
    void PAYMENT_REMINDER_DELAY_HOURS;

    return { data: notification };
  }

  /** POST /v1/webhooks/whatsapp — confirmações de entrega/leitura (PRD 7.3). */
  async handleDeliveryWebhook(providerMessageId: string, status: 'DELIVERED' | 'READ' | 'FAILED') {
    await this.prisma.notification.updateMany({
      where: { payload: { path: ['providerMessageId'], equals: providerMessageId } },
      data: { status, deliveredAt: status === 'DELIVERED' ? new Date() : undefined },
    });
  }

  private buildChargeMessage(params: {
    patientName: string;
    amount: string;
    sessionDate: Date;
    pixKey: string;
  }): string {
    const formattedDate = params.sessionDate.toLocaleDateString('pt-BR');
    return [
      `Olá, ${params.patientName}! 👋`,
      `Segue a cobrança referente à sessão de ${formattedDate}.`,
      `Valor: R$ ${params.amount}`,
      `Chave Pix: ${params.pixKey}`,
    ].join('\n');
  }
}
