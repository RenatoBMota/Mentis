export const RECURRING_LAUNCH_QUEUE = 'recurring-launches';
export const RECURRING_LAUNCH_JOB_NAME = 'monthly-launch';
export const RECURRING_LAUNCH_JOB_ID = 'monthly-recurring-launch';

/** Todo dia 1 às 00:05 (evita concorrência exata com outros jobs de virada de mês). */
export const RECURRING_LAUNCH_CRON = '5 0 1 * *';
