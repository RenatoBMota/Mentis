import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SendChargeLinkDto } from './dto/send-charge-link.dto';
import { WhatsAppService } from './whatsapp.service';

@Controller()
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @UseGuards(JwtAuthGuard)
  // PRD 7.2: 10 req/min para respeitar limites do provedor de WhatsApp.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('whatsapp/send-charge-link')
  sendChargeLink(@Body() dto: SendChargeLinkDto) {
    return this.whatsappService.sendChargeLink(dto.sessionRecordId);
  }

  // Endpoint público (assinatura/validação do provedor a implementar — PRD 7.3).
  @Post('webhooks/whatsapp')
  handleWebhook(@Body() body: { providerMessageId: string; status: 'DELIVERED' | 'READ' | 'FAILED' }) {
    return this.whatsappService.handleDeliveryWebhook(body.providerMessageId, body.status);
  }
}
