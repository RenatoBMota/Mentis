import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppGateway } from './whatsapp-gateway.interface';

/**
 * Implementação de referência para Evolution API. Sem WHATSAPP_API_URL/KEY
 * configurados, opera em modo dry-run (loga a mensagem e retorna um id
 * simulado), permitindo desenvolver o restante do fluxo sem credenciais reais.
 * TODO: trocar por chamada HTTP real ao endpoint de envio da Evolution API.
 */
@Injectable()
export class EvolutionApiGateway implements WhatsAppGateway {
  private readonly logger = new Logger(EvolutionApiGateway.name);

  constructor(private readonly config: ConfigService) {}

  async sendMessage(toPhone: string, message: string): Promise<{ providerMessageId: string }> {
    const apiUrl = this.config.get<string>('WHATSAPP_API_URL');

    if (!apiUrl) {
      this.logger.warn(`[dry-run] WhatsApp -> ${toPhone}: ${message}`);
      return { providerMessageId: `dry-run-${Date.now()}` };
    }

    // TODO: POST para `${apiUrl}/message/sendText` com WHATSAPP_API_KEY.
    throw new Error('EVOLUTION_API_INTEGRATION_NOT_IMPLEMENTED');
  }
}
