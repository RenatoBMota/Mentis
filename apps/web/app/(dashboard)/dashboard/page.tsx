'use client';

import { useQuery } from '@tanstack/react-query';
import { KpiCard } from '@/components/kpi-card';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';

interface DashboardSummary {
  appointmentsToday: number;
  activePatients: number;
  pendingSessions: number;
  monthRevenue: number;
}

interface ReceivablesForecast {
  total: number;
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Dashboard Principal — Visão Geral (PRD 9.3). */
export default function DashboardPage() {
  const token = useAuthToken();

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary', token],
    queryFn: () =>
      apiFetch<{ data: DashboardSummary }>('/dashboard/summary', { token: token! }),
    enabled: Boolean(token),
  });

  const forecastQuery = useQuery({
    queryKey: ['receivables-forecast', token],
    queryFn: () =>
      apiFetch<{ data: ReceivablesForecast }>('/financial/receivables-forecast', {
        token: token!,
      }),
    enabled: Boolean(token),
  });

  const summary = summaryQuery.data?.data;
  const forecast = forecastQuery.data?.data;
  const loading = summaryQuery.isLoading || forecastQuery.isLoading;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-50">Visão Geral</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Sessões Hoje" value={String(summary?.appointmentsToday ?? 0)} loading={loading} />
        <KpiCard
          label="Faturamento do Mês"
          value={currency.format(summary?.monthRevenue ?? 0)}
          loading={loading}
        />
        <KpiCard label="Pacientes Ativos" value={String(summary?.activePatients ?? 0)} loading={loading} />
        <KpiCard
          label="Sessões Pendentes"
          value={String(summary?.pendingSessions ?? 0)}
          loading={loading}
        />
        <KpiCard
          label="Previsão de Recebíveis"
          value={currency.format(forecast?.total ?? 0)}
          loading={loading}
        />
      </div>
    </div>
  );
}
