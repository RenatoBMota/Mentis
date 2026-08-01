import { PatientRecurrenceType } from '@/lib/types';

export const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const RECURRENCE_LABELS: Record<PatientRecurrenceType, string> = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  ONE_OFF: 'Avulsa',
};
