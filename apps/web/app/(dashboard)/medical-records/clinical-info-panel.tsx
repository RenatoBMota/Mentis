'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Patient } from '@/lib/types';
import { useUpdatePatientClinicalInfo } from '@/lib/hooks/use-patients';

interface ClinicalInfoPanelProps {
  patient: Patient;
}

/** Anamnese e Plano Terapêutico — documentos "vivos" do paciente, editáveis
 * in-place, distintos do log imutável de evolução por sessão. */
export function ClinicalInfoPanel({ patient }: ClinicalInfoPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ClinicalField
        patientId={patient.id}
        field="anamnesis"
        title="Anamnese"
        value={patient.anamnesis ?? ''}
        placeholder="Histórico clínico, queixa principal, contexto de vida, encaminhamento…"
      />
      <ClinicalField
        patientId={patient.id}
        field="treatmentPlan"
        title="Plano Terapêutico"
        value={patient.treatmentPlan ?? ''}
        placeholder="Objetivos terapêuticos, abordagem, frequência prevista…"
      />
    </div>
  );
}

function ClinicalField({
  patientId,
  field,
  title,
  value,
  placeholder,
}: {
  patientId: string;
  field: 'anamnesis' | 'treatmentPlan';
  title: string;
  value: string;
  placeholder: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const update = useUpdatePatientClinicalInfo(patientId);
  const { toast } = useToast();

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  async function handleSave() {
    try {
      await update.mutateAsync({ [field]: draft });
      toast(`${title} atualizado(a).`, 'success');
      setEditing(false);
    } catch {
      toast(`Não foi possível salvar ${title.toLowerCase()}. Tente novamente.`, 'error');
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              {value ? 'Editar' : 'Adicionar'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!editing && (
          <p className="whitespace-pre-wrap text-sm text-ink-muted">
            {value || <span className="text-ink-faint">Nenhum registro ainda.</span>}
          </p>
        )}
        {editing && (
          <div className="flex flex-col gap-3">
            <Textarea
              rows={6}
              value={draft}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={update.isPending}>
                {update.isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
