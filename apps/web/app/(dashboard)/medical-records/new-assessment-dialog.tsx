'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import {
  ASSESSMENT_INTRO,
  ASSESSMENT_LABELS,
  ASSESSMENT_QUESTIONS,
  AssessmentType,
} from '@/lib/assessments';
import { useCreateAssessment } from '@/lib/hooks/use-assessments';

const TYPES: AssessmentType[] = ['PHQ9', 'GAD7', 'EPDS', 'SRQ20', 'AUDIT', 'PSS10', 'WHO5'];

interface NewAssessmentDialogProps {
  patientId: string;
}

/** Aplicação de escalas psicológicas validadas direto no prontuário. */
export function NewAssessmentDialog({ patientId }: NewAssessmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AssessmentType>('PHQ9');
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(ASSESSMENT_QUESTIONS.PHQ9.length).fill(null),
  );
  const [error, setError] = useState<string | null>(null);

  const createAssessment = useCreateAssessment(patientId);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setType('PHQ9');
      setAnswers(Array(ASSESSMENT_QUESTIONS.PHQ9.length).fill(null));
      setError(null);
    }
  }, [open]);

  function handleTypeChange(next: AssessmentType) {
    setType(next);
    setAnswers(Array(ASSESSMENT_QUESTIONS[next].length).fill(null));
  }

  function setAnswer(index: number, value: number) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (answers.some((a) => a === null)) {
      setError('Responda todos os itens antes de salvar.');
      return;
    }

    try {
      const result = await createAssessment.mutateAsync({ type, answers: answers as number[] });
      setOpen(false);
      const { totalScore, severity, clinicalAlert } = result.data;
      toast(
        `${ASSESSMENT_LABELS[type]} salva — pontuação ${totalScore}, resultado: ${severity}.`,
        clinicalAlert ? 'error' : 'success',
      );
    } catch {
      setError('Não foi possível salvar a avaliação. Tente novamente.');
    }
  }

  const questions = ASSESSMENT_QUESTIONS[type];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ClipboardList size={16} />
          Nova Avaliação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova avaliação psicológica</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assessmentType">Escala</Label>
            <Select
              id="assessmentType"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as AssessmentType)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {ASSESSMENT_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>

          <p className="text-xs text-ink-faint">{ASSESSMENT_INTRO[type]}</p>

          <div className="flex flex-col gap-4">
            {questions.map((question, index) => (
              <div key={index} className="flex flex-col gap-2 border-b border-border pb-4 last:border-b-0">
                <p className="text-sm text-ink">
                  <span className="text-ink-faint">{index + 1}. </span>
                  {question.text}
                </p>
                <div className="flex flex-wrap gap-2">
                  {question.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAnswer(index, option.value)}
                      className={cn(
                        'rounded-md border px-2 py-1.5 text-xs font-medium text-ink-muted hover:border-accent-primary hover:text-ink',
                        answers[index] === option.value
                          ? 'border-accent-primary bg-accent-soft text-accent-strong'
                          : 'border-border',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={createAssessment.isPending} className="mt-2">
            {createAssessment.isPending && <Loader2 size={16} className="animate-spin" />}
            {createAssessment.isPending ? 'Salvando…' : 'Salvar avaliação'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
