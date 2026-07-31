/** Segunda-feira da semana que contém `date`, à meia-noite local. */
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const WEEKDAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
export const AGENDA_HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 08:00–19:00
