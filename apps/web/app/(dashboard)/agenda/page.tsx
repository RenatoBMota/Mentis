'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWeeklyAgenda } from '@/lib/hooks/use-agenda';
import { addDays, AGENDA_HOURS, getWeekStart, WEEKDAY_LABELS } from '@/lib/week';
import { Appointment, AppointmentStatus } from '@/lib/types';
import { NewAppointmentDialog } from './new-appointment-dialog';

const STATUS_CLASSES: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-accent-highlight/20 border-accent-highlight/40 text-accent-highlight',
  CONFIRMED: 'bg-status-success/20 border-status-success/40 text-status-success',
  COMPLETED: 'bg-status-success/20 border-status-success/40 text-status-success',
  NO_SHOW: 'bg-status-danger/20 border-status-danger/40 text-status-danger',
  CANCELED: 'bg-white/10 border-white/20 text-slate-400 line-through',
};

/** Gestão de Agenda Semanal (PRD 9.4). */
export default function AgendaPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const agendaQuery = useWeeklyAgenda(weekStart);
  const appointments = useMemo(() => agendaQuery.data?.data ?? [], [agendaQuery.data]);

  const appointmentsBySlot = useMemo(() => {
    const map = new Map<string, Appointment>();
    for (const appointment of appointments) {
      const date = new Date(appointment.dateTime);
      map.set(slotKey(date), appointment);
    }
    return map;
  }, [appointments]);

  const upcoming = useMemo(
    () =>
      [...appointments]
        .filter((a) => new Date(a.dateTime) >= new Date())
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
        .slice(0, 5),
    [appointments],
  );

  function handleSlotClick(date: Date, hour: number) {
    const slot = new Date(date);
    slot.setHours(hour, 0, 0, 0);
    setSelectedSlot(slot);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-50">Agenda</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekStart((prev) => addDays(prev, -7))}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-slate-300">
            {weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} –{' '}
            {addDays(weekStart, 4).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
          <Button variant="outline" size="sm" onClick={() => setWeekStart((prev) => addDays(prev, 7))}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <div className="grid min-w-[700px] grid-cols-[64px_repeat(5,1fr)]">
          <div className="border-b border-white/10 p-2" />
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              className="border-b border-l border-white/10 p-2 text-center text-xs font-medium text-slate-400"
            >
              {label}
              <br />
              <span className="text-slate-500">
                {addDays(weekStart, i).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
          ))}

          {AGENDA_HOURS.map((hour) => (
            <div key={hour} className="contents">
              <div className="border-b border-white/5 p-2 text-right text-xs text-slate-500">{hour}:00</div>
              {WEEKDAY_LABELS.map((_, i) => {
                const day = addDays(weekStart, i);
                const appointment = appointmentsBySlot.get(slotKey(day, hour));
                return (
                  <button
                    key={i}
                    onClick={() => !appointment && handleSlotClick(day, hour)}
                    disabled={Boolean(appointment)}
                    className={cn(
                      'min-h-14 border-b border-l border-white/5 p-1 text-left transition-colors',
                      !appointment && 'hover:bg-white/5',
                    )}
                  >
                    {appointment && (
                      <div
                        className={cn(
                          'flex h-full flex-col justify-center rounded border px-2 py-1 text-xs',
                          STATUS_CLASSES[appointment.status],
                        )}
                      >
                        <span className="flex items-center gap-1 font-medium">
                          {appointment.modality === 'ONLINE' ? <Video size={12} /> : <MapPin size={12} />}
                          {appointment.patient?.fullName ?? 'Paciente'}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">Próximas sessões</h2>
        {upcoming.length === 0 && <p className="text-sm text-slate-500">Nenhuma sessão futura nesta semana.</p>}
        <ul className="flex flex-col gap-2">
          {upcoming.map((appointment) => (
            <li key={appointment.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-200">{appointment.patient?.fullName ?? 'Paciente'}</span>
              <span className="text-slate-500">
                {new Date(appointment.dateTime).toLocaleString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <NewAppointmentDialog open={dialogOpen} onOpenChange={setDialogOpen} initialDateTime={selectedSlot} />
    </div>
  );
}

function slotKey(date: Date, hour?: number): string {
  const h = hour ?? date.getHours();
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${h}`;
}
