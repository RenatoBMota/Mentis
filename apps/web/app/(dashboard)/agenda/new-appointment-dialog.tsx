'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { usePatients } from '@/lib/hooks/use-patients';
import { useCreateAppointment } from '@/lib/hooks/use-agenda';
import { AppointmentModality } from '@/lib/types';

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDateTime: Date | null;
}

function defaultSlot(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

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

/** Modal de criação em até 30s (RF-03). Pré-preenchido com o slot clicado na grade,
 * ou com o próximo horário cheio quando aberto pelo botão "Nova sessão". */
export function NewAppointmentDialog({ open, onOpenChange, initialDateTime }: NewAppointmentDialogProps) {
  const patientsQuery = usePatients({ status: 'ACTIVE' });
  const createAppointment = useCreateAppointment();

  const [patientId, setPatientId] = useState('');
  const [modality, setModality] = useState<AppointmentModality>('IN_PERSON');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const patients = patientsQuery.data?.data ?? [];

  useEffect(() => {
    if (open) {
      setPatientId('');
      setModality('IN_PERSON');
      setPrice('');
      setError(null);

      const seed = initialDateTime ?? defaultSlot();
      setDate(toDateInputValue(seed));
      setTime(toTimeInputValue(seed));
    }
  }, [open, initialDateTime]);

  function handlePatientChange(id: string) {
    setPatientId(id);
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      setPrice(patient.pricePerSession);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!date || !time) return;
    setError(null);

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const dateTime = new Date(year, month - 1, day, hour, minute, 0, 0);

    try {
      await createAppointment.mutateAsync({
        patientId,
        dateTime: dateTime.toISOString(),
        modality,
        price: Number(price),
      });
      onOpenChange(false);
    } catch {
      setError('Não foi possível criar o agendamento. Verifique se já não há sessão nesse horário.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="patientId">Paciente</Label>
            <Select
              id="patientId"
              required
              value={patientId}
              onChange={(e) => handlePatientChange(e.target.value)}
            >
              <option value="" disabled>
                Selecione um paciente
              </option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="modality">Modalidade</Label>
              <Select
                id="modality"
                value={modality}
                onChange={(e) => setModality(e.target.value as AppointmentModality)}
              >
                <option value="IN_PERSON">Presencial</option>
                <option value="ONLINE">Online</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Valor (R$)</Label>
              <Input
                id="price"
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

          <Button type="submit" disabled={createAppointment.isPending || !patientId} className="mt-2">
            {createAppointment.isPending ? 'Agendando…' : 'Confirmar agendamento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
