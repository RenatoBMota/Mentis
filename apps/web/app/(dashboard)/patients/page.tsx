'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePatients } from '@/lib/hooks/use-patients';
import { useAuthToken } from '@/lib/use-auth-token';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { apiFetch } from '@/lib/api-client';
import { PatientStatus } from '@/lib/types';
import { NewPatientDialog } from './new-patient-dialog';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const RECURRENCE_LABELS: Record<string, string> = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  ONE_OFF: 'Avulsa',
};

const STATUS_FILTERS: { label: string; value: PatientStatus | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Ativos', value: 'ACTIVE' },
  { label: 'Avaliação', value: 'IN_EVALUATION' },
  { label: 'Inativos', value: 'INACTIVE' },
];

function useDeletePatient() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/patients/${id}`, { method: 'DELETE', token: token! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  });
}

/** Cadastro e Lista de Pacientes (PRD 9.5). */
export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | undefined>(undefined);
  const debouncedSearch = useDebouncedValue(search, 300);

  const patientsQuery = usePatients({ search: debouncedSearch || undefined, status: statusFilter });
  const deletePatient = useDeletePatient();

  const patients = useMemo(() => patientsQuery.data?.data ?? [], [patientsQuery.data]);

  const metrics = useMemo(() => {
    const active = patients.filter((p) => p.status === 'ACTIVE').length;
    const inEvaluation = patients.filter((p) => p.status === 'IN_EVALUATION').length;
    const avgTicket =
      patients.length > 0
        ? patients.reduce((sum, p) => sum + Number(p.pricePerSession), 0) / patients.length
        : 0;
    return { active, inEvaluation, avgTicket, total: patients.length };
  }, [patients]);

  function handleDelete(id: string, name: string) {
    if (window.confirm(`Excluir o cadastro de ${name}? Essa ação não pode ser desfeita.`)) {
      deletePatient.mutate(id);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-50">Pacientes</h1>
        <NewPatientDialog />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-50">{metrics.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Em Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-50">{metrics.inEvaluation}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-50">{currency.format(metrics.avgTicket)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-50">{metrics.total}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium text-slate-300 hover:text-slate-50',
                statusFilter === filter.value
                  ? 'border-accent-highlight bg-accent-highlight/10 text-accent-highlight'
                  : 'border-white/15',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Buscar por nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patientsQuery.isLoading &&
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40" />)}

        {!patientsQuery.isLoading && patients.length === 0 && (
          <p className="col-span-full text-sm text-slate-500">Nenhum paciente encontrado.</p>
        )}

        {patients.map((patient) => (
          <Card key={patient.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold text-slate-50">{patient.fullName}</CardTitle>
                <Badge
                  tone={
                    patient.status === 'ACTIVE'
                      ? 'success'
                      : patient.status === 'IN_EVALUATION'
                        ? 'warning'
                        : 'neutral'
                  }
                >
                  {patient.status === 'ACTIVE'
                    ? 'Ativo'
                    : patient.status === 'IN_EVALUATION'
                      ? 'Em Avaliação'
                      : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-slate-400">
              {patient.age && <p>{patient.age} anos</p>}
              <p>{RECURRENCE_LABELS[patient.recurrenceType]}</p>
              <p className="font-medium text-slate-200">{currency.format(Number(patient.pricePerSession))}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/medical-records?patientId=${patient.id}`}>
                    <FileText size={14} />
                    Prontuário
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(patient.id, patient.fullName)}
                  className="text-status-danger hover:bg-status-danger/10"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
