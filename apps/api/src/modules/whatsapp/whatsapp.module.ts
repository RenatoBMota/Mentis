import { Module } from '@nestjs/common';
import { EvolutionApiGateway } from './evolution-api.gateway';
import { WHATSAPP_GATEWAY } from './whatsapp-gateway.interface';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';

@Module({
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    { provide: WHATSAPP_GATEWAY, useClass: EvolutionApiGateway },
  ],
})
export class WhatsAppModule {}
