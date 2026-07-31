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

/** Modal de criação em até 30s (RF-03), pré-preenchido com o slot clicado. */
export function NewAppointmentDialog({ open, onOpenChange, initialDateTime }: NewAppointmentDialogProps) {
  const patientsQuery = usePatients({ status: 'ACTIVE' });
  const createAppointment = useCreateAppointment();

  const [patientId, setPatientId] = useState('');
  const [modality, setModality] = useState<AppointmentModality>('IN_PERSON');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  const patients = patientsQuery.data?.data ?? [];

  useEffect(() => {
    if (open) {
      setPatientId('');
      setModality('IN_PERSON');
      setPrice('');
      setError(null);
    }
  }, [open]);

  function handlePatientChange(id: string) {
    setPatientId(id);
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      setPrice(patient.pricePerSession);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!initialDateTime) return;
    setError(null);

    try {
      await createAppointment.mutateAsync({
        patientId,
        dateTime: initialDateTime.toISOString(),
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
          {initialDateTime && (
            <p className="text-sm text-slate-400">
              {initialDateTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              {' às '}
              {initialDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
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
