'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import {
  useCancelAppointment,
  useUpdateAppointment,
} from '@/lib/hooks/use-agenda';
import { useCompleteAppointment, useMarkNoShow } from '@/lib/hooks/use-sessions';
import { Appointment, AppointmentModality, AppointmentStatus } from '@/lib/types';

interface ManageAppointmentDialogProps {
  appointment: Appointment | null;
  onOpenChange: (open: boolean) => void;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendada',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Realizada',
  NO_SHOW: 'Faltou',
  CANCELED: 'Cancelada',
};

const STATUS_TONES: Record<AppointmentStatus, 'success' | 'warning' | 'danger' | 'accent' | 'neutral'> = {
  SCHEDULED: 'accent',
  CONFIRMED: 'success',
  COMPLETED: 'success',
  NO_SHOW: 'danger',
  CANCELED: 'neutral',
};

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toTimeInputValue(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

/** Gerenciar um agendamento existente: reagendar, mudar modalidade/valor, marcar realizada/falta ou cancelar. */
export function ManageAppointmentDialog({ appointment, onOpenChange }: ManageAppointmentDialogProps) {
  const [modality, setModality] = useState<AppointmentModality>('IN_PERSON');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const updateAppointment = useUpdateAppointment(appointment?.id ?? null);
  const cancelAppointment = useCancelAppointment();
  const completeAppointment = useCompleteAppointment();
  const markNoShow = useMarkNoShow();
  const { toast } = useToast();

  useEffect(() => {
    if (appointment) {
      const dt = new Date(appointment.dateTime);
      setDate(toDateInputValue(dt));
      setTime(toTimeInputValue(dt));
      setModality(appointment.modality);
      setPrice(appointment.price);
      setError(null);
    }
  }, [appointment]);

  if (!appointment) return null;

  const canTransition = appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED';

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!date || !time || !appointment) return;
    setError(null);

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const dateTime = new Date(year, month - 1, day, hour, minute, 0, 0);

    try {
      await updateAppointment.mutateAsync({
        dateTime: dateTime.toISOString(),
        modality,
        price: Number(price),
      });
      toast('Agendamento atualizado.', 'success');
      onOpenChange(false);
    } catch {
      setError('Não foi possível salvar. Verifique se já não há sessão nesse horário.');
    }
  }

  async function handleComplete() {
    if (!appointment) return;
    try {
      await completeAppointment.mutateAsync(appointment.id);
      toast('Sessão marcada como realizada.', 'success');
      onOpenChange(false);
    } catch {
      toast('Não foi possível marcar como realizada.', 'error');
    }
  }

  async function handleNoShow() {
    if (!appointment) return;
    try {
      await markNoShow.mutateAsync(appointment.id);
      toast('Sessão marcada como falta.', 'success');
      onOpenChange(false);
    } catch {
      toast('Não foi possível marcar a falta.', 'error');
    }
  }

  async function handleCancel() {
    if (!appointment) return;
    try {
      await cancelAppointment.mutateAsync(appointment.id);
      toast('Agendamento cancelado.', 'success');
      setConfirmCancelOpen(false);
      onOpenChange(false);
    } catch {
      toast('Não foi possível cancelar o agendamento.', 'error');
    }
  }

  return (
    <>
      <Dialog open={Boolean(appointment)} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>{appointment.patient?.fullName ?? 'Paciente'}</DialogTitle>
              <Badge tone={STATUS_TONES[appointment.status]}>{STATUS_LABELS[appointment.status]}</Badge>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editDate">Data</Label>
                <Input id="editDate" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editTime">Horário</Label>
                <Input id="editTime" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editModality">Modalidade</Label>
                <Select
                  id="editModality"
                  value={modality}
                  onChange={(e) => setModality(e.target.value as AppointmentModality)}
                >
                  <option value="IN_PERSON">Presencial</option>
                  <option value="ONLINE">Online</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editPrice">Valor (R$)</Label>
                <Input
                  id="editPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-status-danger">{error}</p>}

            <Button type="submit" disabled={updateAppointment.isPending} className="mt-1">
              {updateAppointment.isPending ? 'Salvando…' : 'Salvar alterações'}
            </Button>

            {canTransition && (
              <div className="flex gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={completeAppointment.isPending}
                  onClick={handleComplete}
                >
                  Marcar realizada
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={markNoShow.isPending}
                  onClick={handleNoShow}
                >
                  Marcar falta
                </Button>
              </div>
            )}

            {appointment.status !== 'CANCELED' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-status-danger hover:bg-status-danger/10"
                onClick={() => setConfirmCancelOpen(true)}
              >
                Cancelar agendamento
              </Button>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="Cancelar agendamento"
        description={`Cancelar a sessão de ${appointment.patient?.fullName ?? 'paciente'} em ${new Date(
          appointment.dateTime,
        ).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}? Essa ação não pode ser desfeita.`}
        confirmLabel="Cancelar agendamento"
        destructive
        loading={cancelAppointment.isPending}
        onConfirm={handleCancel}
      />
    </>
  );
}
