'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { usePatient, usePatients } from '@/lib/hooks/use-patients';
import { openReferralPdf } from '@/lib/hooks/use-referrals';
import { usePatientTimeline } from '@/lib/hooks/use-patient-timeline';
import { useAuthToken } from '@/lib/use-auth-token';
import { NewEvolutionDialog } from './new-evolution-dialog';
import { ExportPdfDialog } from './export-pdf-dialog';
import { NewReferralDialog } from './new-referral-dialog';
import { ClinicalInfoPanel } from './clinical-info-panel';
import { AssessmentPanel } from './assessment-panel';
import { Timeline } from './timeline';

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

  const { timeline, nextSessionNumber, isLoading: timelineLoading } = usePatientTimeline(patientId);

  const patientQuery = usePatient(patientId);
  const patient = patientQuery.data;

  const token = useAuthToken();
  const { toast } = useToast();

  async function handlePrintReferral(id: string) {
    if (!token) return;
    try {
      await openReferralPdf(id, token);
    } catch {
      toast('Não foi possível abrir o documento. Tente novamente.', 'error');
    }
  }

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

      {patient && <ClinicalInfoPanel patient={patient} />}

      {patientId && <AssessmentPanel patientId={patientId} />}

      {patientId && timelineLoading && <div className="skeleton h-40" />}

      {patientId && !timelineLoading && (
        <Timeline items={timeline} onPrintReferral={handlePrintReferral} />
      )}
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
