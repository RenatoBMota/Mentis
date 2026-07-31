import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Conexão Redis compartilhada para todas as filas BullMQ da aplicação
 * (PRD 5.4: "Redis para filas (BullMQ) de envio de WhatsApp e lembretes
 * agendados"). Módulo global para que qualquer feature module possa
 * registrar sua própria fila com BullModule.registerQueue sem reimportar
 * a configuração de conexão.
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = new URL(config.getOrThrow<string>('REDIS_URL'));
        return {
          connection: {
            host: redisUrl.hostname,
            port: Number(redisUrl.port || 6379),
            password: redisUrl.password || undefined,
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
