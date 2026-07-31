import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EvolutionApiGateway } from './evolution-api.gateway';
import { WHATSAPP_GATEWAY } from './whatsapp-gateway.interface';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { PaymentReminderProcessor } from './payment-reminder.processor';
import { PAYMENT_REMINDER_QUEUE } from './payment-reminder.queue';

@Module({
  imports: [BullModule.registerQueue({ name: PAYMENT_REMINDER_QUEUE })],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    PaymentReminderProcessor,
    { provide: WHATSAPP_GATEWAY, useClass: EvolutionApiGateway },
  ],
})
export class WhatsAppModule {}
