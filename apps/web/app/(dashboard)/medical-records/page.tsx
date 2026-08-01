'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { usePatients } from '@/lib/hooks/use-patients';
import { useMedicalRecords } from '@/lib/hooks/use-medical-records';
import { openReferralPdf, useReferrals } from '@/lib/hooks/use-referrals';
import { useAuthToken } from '@/lib/use-auth-token';
import { NewEvolutionDialog } from './new-evolution-dialog';
import { ExportPdfDialog } from './export-pdf-dialog';
import { NewReferralDialog } from './new-referral-dialog';

/** Prontuário Clínico & Evolução (PRD 9.6). */
function MedicalRecordsContent() {
  const searchParams = useSearchParams();
  const patientsQuery = usePatients();
  const patients = useMemo(() => patientsQuery.data?.data ?? [], [patientsQuery.data]);

  const [patientId, setPatientId] = useState<string | null>(searchParams.get('patientId'));

  useEffect(() => {
    if (!patientId && patients.length > 0) {
      setPatientId(patients[0].id);
    }
  }, [patientId, patients]);

  const recordsQuery = useMedicalRecords(patientId);
  const records = useMemo(
    () => [...(recordsQuery.data?.data ?? [])].sort((a, b) => a.sessionNumber - b.sessionNumber),
    [recordsQuery.data],
  );
  const nextSessionNumber = records.length > 0 ? records[records.length - 1].sessionNumber + 1 : 1;

  const referralsQuery = useReferrals(patientId);
  const referrals = useMemo(() => referralsQuery.data?.data ?? [], [referralsQuery.data]);

  const token = useAuthToken();
  const { toast } = useToast();

  type TimelineItem =
    | { kind: 'evolution'; date: string; record: (typeof records)[number] }
    | { kind: 'referral'; date: string; referral: (typeof referrals)[number] };

  const timeline: TimelineItem[] = useMemo(() => {
    const evolutionItems: TimelineItem[] = records.map((record) => ({
      kind: 'evolution',
      date: record.createdAt,
      record,
    }));
    const referralItems: TimelineItem[] = referrals.map((referral) => ({
      kind: 'referral',
      date: referral.createdAt,
      referral,
    }));
    return [...evolutionItems, ...referralItems].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [records, referrals]);

  async function handlePrintReferral(id: string) {
    if (!token) return;
    try {
      await openReferralPdf(id, token);
    } catch {
      toast('Não foi possível abrir o documento. Tente novamente.', 'error');
    }
  }

  const loading = recordsQuery.isLoading || referralsQuery.isLoading;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="patientSelect">Paciente</Label>
          <Select
            id="patientSelect"
            className="w-64"
            value={patientId ?? ''}
            onChange={(e) => setPatientId(e.target.value)}
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

        {patientId && (
          <div className="flex gap-2">
            <NewEvolutionDialog patientId={patientId} nextSessionNumber={nextSessionNumber} />
            <NewReferralDialog patientId={patientId} />
            <ExportPdfDialog patientId={patientId} />
          </div>
        )}
      </div>

      {!patientId && (
        <p className="text-sm text-ink-faint">Selecione um paciente para ver o histórico de evolução.</p>
      )}

      {patientId && loading && <div className="skeleton h-40" />}

      {patientId && !loading && timeline.length === 0 && (
        <p className="text-sm text-ink-faint">Nenhuma evolução registrada ainda.</p>
      )}

      <div className="flex flex-col gap-4">
        {timeline.map((item) =>
          item.kind === 'referral' ? (
            <Card key={`referral-${item.referral.id}`} className="border-accent-primary/30 bg-accent-soft/30">
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-ink">Encaminhamento — {item.referral.type}</h3>
                  <span className="text-xs text-ink-faint">
                    {new Date(item.referral.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                {item.referral.recipient && (
                  <p className="text-sm text-ink-muted">
                    <span className="font-medium text-ink-muted">Destinatário: </span>
                    {item.referral.recipient}
                  </p>
                )}
                <p className="text-sm text-ink-muted">{item.referral.content}</p>
                <div className="mt-1">
                  <Button variant="outline" size="sm" onClick={() => handlePrintReferral(item.referral.id)}>
                    <Printer size={14} />
                    Abrir / Imprimir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card key={item.record.id}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-ink">Sessão nº {item.record.sessionNumber}</h3>
                  <span className="text-xs text-ink-faint">
                    {new Date(item.record.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-ink-muted">{item.record.evolutionText}</p>
                {item.record.observations && (
                  <p className="text-sm text-ink-muted">
                    <span className="font-medium text-ink-muted">Observações: </span>
                    {item.record.observations}
                  </p>
                )}
                {item.record.stepsText && (
                  <p className="text-sm text-ink-muted">
                    <span className="font-medium text-ink-muted">Próximos passos: </span>
                    {item.record.stepsText}
                  </p>
                )}
                {item.record.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.record.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full border border-border px-2 py-0.5 text-xs text-ink-muted"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}

export default function MedicalRecordsPage() {
  return (
    <Suspense fallback={<div className="skeleton h-40" />}>
      <MedicalRecordsContent />
    </Suspense>
  );
}
