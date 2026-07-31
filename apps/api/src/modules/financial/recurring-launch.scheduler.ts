import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  RECURRING_LAUNCH_CRON,
  RECURRING_LAUNCH_JOB_ID,
  RECURRING_LAUNCH_JOB_NAME,
  RECURRING_LAUNCH_QUEUE,
} from './recurring-launch.queue';

/**
 * Agenda o job repetível de lançamentos recorrentes no boot da aplicação.
 * BullMQ deduplica jobs repetíveis pela combinação de nome/padrão/jobId,
 * então reexecutar isto a cada deploy não cria agendamentos duplicados.
 */
@Injectable()
export class RecurringLaunchScheduler implements OnModuleInit {
  constructor(@InjectQueue(RECURRING_LAUNCH_QUEUE) private readonly queue: Queue) {}

  async onModuleInit(): Promise<void> {
    await this.queue.add(
      RECURRING_LAUNCH_JOB_NAME,
      {},
      { repeat: { pattern: RECURRING_LAUNCH_CRON }, jobId: RECURRING_LAUNCH_JOB_ID },
    );
  }
}
