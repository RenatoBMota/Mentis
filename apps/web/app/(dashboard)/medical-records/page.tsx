'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { usePatients } from '@/lib/hooks/use-patients';
import { useMedicalRecords } from '@/lib/hooks/use-medical-records';
import { NewEvolutionDialog } from './new-evolution-dialog';
import { ExportPdfDialog } from './export-pdf-dialog';

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
  const records = [...(recordsQuery.data?.data ?? [])].sort((a, b) => a.sessionNumber - b.sessionNumber);
  const nextSessionNumber = records.length > 0 ? records[records.length - 1].sessionNumber + 1 : 1;

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
            <ExportPdfDialog patientId={patientId} />
          </div>
        )}
      </div>

      {!patientId && (
        <p className="text-sm text-slate-500">Selecione um paciente para ver o histórico de evolução.</p>
      )}

      {patientId && recordsQuery.isLoading && <div className="skeleton h-40" />}

      {patientId && !recordsQuery.isLoading && records.length === 0 && (
        <p className="text-sm text-slate-500">Nenhuma evolução registrada ainda.</p>
      )}

      <div className="flex flex-col gap-4">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-50">Sessão nº {record.sessionNumber}</h3>
                <span className="text-xs text-slate-500">
                  {new Date(record.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <p className="text-sm text-slate-300">{record.evolutionText}</p>
              {record.observations && (
                <p className="text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Observações: </span>
                  {record.observations}
                </p>
              )}
              {record.stepsText && (
                <p className="text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Próximos passos: </span>
                  {record.stepsText}
                </p>
              )}
              {record.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {record.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-slate-400"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
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
