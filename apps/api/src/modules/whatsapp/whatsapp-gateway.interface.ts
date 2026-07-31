/**
 * Abstração de gateway WhatsApp (PRD 5.4, 15 — mitigação de risco de bloqueio
 * do provedor): permite trocar Evolution API / Z-API sem tocar nos módulos
 * de domínio que disparam cobrança e lembretes.
 */
export interface WhatsAppGateway {
  sendMessage(toPhone: string, message: string): Promise<{ providerMessageId: string }>;
}

export const WHATSAPP_GATEWAY = Symbol('WHATSAPP_GATEWAY');
