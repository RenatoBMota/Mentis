'use client';

import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useCreateMedicalRecord } from '@/lib/hooks/use-medical-records';

interface NewEvolutionDialogProps {
  patientId: string;
  nextSessionNumber: number;
}

/** Registro de evolução (RF-05), com tags técnicas separadas por vírgula. */
export function NewEvolutionDialog({ patientId, nextSessionNumber }: NewEvolutionDialogProps) {
  const [open, setOpen] = useState(false);
  const [sessionNumber, setSessionNumber] = useState(nextSessionNumber);
  const [evolutionText, setEvolutionText] = useState('');
  const [observations, setObservations] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createRecord = useCreateMedicalRecord(patientId);

  useEffect(() => {
    if (open) {
      setSessionNumber(nextSessionNumber);
      setEvolutionText('');
      setObservations('');
      setStepsText('');
      setTagsInput('');
      setError(null);
    }
  }, [open, nextSessionNumber]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createRecord.mutateAsync({
        sessionNumber,
        evolutionText,
        observations: observations || undefined,
        stepsText: stepsText || undefined,
        tags: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setOpen(false);
    } catch {
      setError('Não foi possível salvar a evolução. Tente novamente.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          Nova Evolução
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova evolução</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sessionNumber">Número da sessão</Label>
            <Input
              id="sessionNumber"
              type="number"
              min={1}
              required
              value={sessionNumber}
              onChange={(e) => setSessionNumber(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="evolutionText">Relato da evolução</Label>
            <Textarea
              id="evolutionText"
              required
              rows={4}
              value={evolutionText}
              onChange={(e) => setEvolutionText(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="observations">Observações</Label>
            <Textarea id="observations" rows={2} value={observations} onChange={(e) => setObservations(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stepsText">Próximos passos</Label>
            <Textarea id="stepsText" rows={2} value={stepsText} onChange={(e) => setStepsText(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">Tags técnicas (separadas por vírgula)</Label>
            <Input
              id="tags"
              placeholder="TCC, Ansiedade, Reestruturação Cognitiva"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={createRecord.isPending} className="mt-2">
            {createRecord.isPending ? 'Salvando…' : 'Salvar evolução'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
