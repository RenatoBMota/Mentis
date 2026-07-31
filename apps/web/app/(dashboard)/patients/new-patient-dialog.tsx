'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCreatePatient } from '@/lib/hooks/use-patients';
import { PatientRecurrenceType } from '@/lib/types';

export function NewPatientDialog() {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<PatientRecurrenceType>('WEEKLY');
  const [pricePerSession, setPricePerSession] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createPatient = useCreatePatient();

  function resetForm() {
    setFullName('');
    setAge('');
    setPhone('');
    setRecurrenceType('WEEKLY');
    setPricePerSession('');
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createPatient.mutateAsync({
        fullName,
        age: age ? Number(age) : undefined,
        phone,
        recurrenceType,
        pricePerSession: Number(pricePerSession),
      });
      resetForm();
      setOpen(false);
    } catch {
      setError('Não foi possível cadastrar o paciente. Tente novamente.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          Novo paciente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="age">Idade</Label>
              <Input id="age" type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone (WhatsApp)</Label>
              <Input
                id="phone"
                required
                placeholder="+5511999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recurrenceType">Recorrência</Label>
              <Select
                id="recurrenceType"
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value as PatientRecurrenceType)}
              >
                <option value="WEEKLY">Semanal</option>
                <option value="BIWEEKLY">Quinzenal</option>
                <option value="ONE_OFF">Avulsa</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pricePerSession">Valor por sessão (R$)</Label>
              <Input
                id="pricePerSession"
                type="number"
                min={0}
                step="0.01"
                required
                value={pricePerSession}
                onChange={(e) => setPricePerSession(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={createPatient.isPending} className="mt-2">
            {createPatient.isPending ? 'Salvando…' : 'Cadastrar paciente'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
