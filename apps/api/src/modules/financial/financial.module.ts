import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { RecurringLaunchProcessor } from './recurring-launch.processor';
import { RecurringLaunchScheduler } from './recurring-launch.scheduler';
import { RECURRING_LAUNCH_QUEUE } from './recurring-launch.queue';

@Module({
  imports: [BullModule.registerQueue({ name: RECURRING_LAUNCH_QUEUE })],
  controllers: [FinancialController],
  providers: [FinancialService, RecurringLaunchProcessor, RecurringLaunchScheduler],
})
export class FinancialModule {}
