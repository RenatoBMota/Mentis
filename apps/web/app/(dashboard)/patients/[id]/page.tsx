'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { usePatient, useUpdatePatientStatus } from '@/lib/hooks/use-patients';
import { usePatientTimeline } from '@/lib/hooks/use-patient-timeline';
import { openReferralPdf } from '@/lib/hooks/use-referrals';
import { useAuthToken } from '@/lib/use-auth-token';
import { currency, RECURRENCE_LABELS } from '@/lib/patient-format';
import { cn } from '@/lib/utils';
import { PatientStatus } from '@/lib/types';
import { ClinicalInfoPanel } from '../../medical-records/clinical-info-panel';
import { AssessmentPanel } from '../../medical-records/assessment-panel';
import { LibraryPanel } from '../../medical-records/library-panel';
import { Timeline } from '../../medical-records/timeline';

const STATUS_LABELS: Record<PatientStatus, string> = {
  ACTIVE: 'Ativo',
  IN_EVALUATION: 'Em Avaliação',
  INACTIVE: 'Inativo',
};

const STATUS_SELECT_CLASSES: Record<PatientStatus, string> = {
  ACTIVE: 'border-status-success/40 bg-status-success-soft text-status-success',
  IN_EVALUATION: 'border-status-warning/40 bg-status-warning-soft text-status-warning',
  INACTIVE: 'border-border bg-surface-raised text-ink-muted',
};

const STATUS_OPTIONS: PatientStatus[] = ['ACTIVE', 'IN_EVALUATION', 'INACTIVE'];

/** Visão Geral do Paciente: centraliza sessões, encaminhamentos e avaliações num único histórico. */
export default function PatientProfilePage() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;

  const patientQuery = usePatient(patientId);
  const patient = patientQuery.data;

  const { timeline, records, referrals, isLoading: timelineLoading } = usePatientTimeline(patientId);

  const token = useAuthToken();
  const { toast } = useToast();
  const updateStatus = useUpdatePatientStatus(patientId);

  async function handleStatusChange(status: PatientStatus) {
    try {
      await updateStatus.mutateAsync(status);
      toast(`Status atualizado para "${STATUS_LABELS[status]}".`, 'success');
    } catch {
      toast('Não foi possível atualizar o status. Tente novamente.', 'error');
    }
  }

  async function handlePrintReferral(id: string) {
    if (!token) return;
    try {
      await openReferralPdf(id, token);
    } catch {
      toast('Não foi possível abrir o documento. Tente novamente.', 'error');
    }
  }

  const lastSession = records.length > 0 ? records[records.length - 1] : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/patients"
        className="inline-flex w-fit items-center gap-1 text-sm text-ink-faint hover:text-ink"
      >
        <ArrowLeft size={14} />
        Pacientes
      </Link>

      {patientQuery.isLoading && <div className="skeleton h-24" />}

      {!patientQuery.isLoading && !patient && (
        <p className="text-sm text-ink-faint">Paciente não encontrado.</p>
      )}

      {patient && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-ink">{patient.fullName}</h1>
                <Select
                  value={patient.status}
                  disabled={updateStatus.isPending}
                  onChange={(e) => handleStatusChange(e.target.value as PatientStatus)}
                  className={cn(
                    'h-7 w-auto py-0 pl-2.5 pr-7 text-xs font-medium',
                    STATUS_SELECT_CLASSES[patient.status],
                  )}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>
              </div>
              <p className="text-sm text-ink-muted">
                {patient.age ? `${patient.age} anos · ` : ''}
                {RECURRENCE_LABELS[patient.recurrenceType]} ·{' '}
                {currency.format(Number(patient.pricePerSession))}
              </p>
            </div>
            <Button asChild>
              <Link href={`/medical-records?patientId=${patientId}`}>
                <FileText size={14} />
                Ir para o Prontuário
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Sessões</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-ink">{records.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Encaminhamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-ink">{referrals.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Última Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-ink">
                  {lastSession ? new Date(lastSession.createdAt).toLocaleDateString('pt-BR') : '—'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Paciente desde</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-ink">
                  {new Date(patient.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          </div>

          <ClinicalInfoPanel patient={patient} />

          <AssessmentPanel patientId={patientId} />

          <LibraryPanel patientId={patientId} />

          <Card>
            <CardHeader>
              <CardTitle>Histórico Completo</CardTitle>
            </CardHeader>
            <CardContent>
              {timelineLoading && <div className="skeleton h-40" />}
              {!timelineLoading && <Timeline items={timeline} onPrintReferral={handlePrintReferral} />}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
