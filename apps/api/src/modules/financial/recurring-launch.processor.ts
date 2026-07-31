import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FinancialService } from './financial.service';
import { RECURRING_LAUNCH_QUEUE } from './recurring-launch.queue';

/** RF-10: no dia 1 de cada mês, replica os templates recorrentes de cada usuário. */
@Processor(RECURRING_LAUNCH_QUEUE)
export class RecurringLaunchProcessor extends WorkerHost {
  private readonly logger = new Logger(RecurringLaunchProcessor.name);

  constructor(private readonly financialService: FinancialService) {
    super();
  }

  async process(_job: Job): Promise<void> {
    const userIds = await this.financialService.listUserIdsWithRecurringTemplates();
    this.logger.log(`Lançamento recorrente mensal: ${userIds.length} usuário(s) com templates ativos.`);

    for (const userId of userIds) {
      await this.financialService.launchMonthlyRecurring(userId);
    }
  }
}
