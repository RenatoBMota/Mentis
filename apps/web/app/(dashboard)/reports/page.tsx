'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAttendanceReport } from '@/lib/hooks/use-reports';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendada',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Realizada',
  NO_SHOW: 'Faltou',
  CANCELED: 'Cancelada',
};

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Relatórios e Exportação (PRD 9.9 / RF-11). */
export default function ReportsPage() {
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const [from, setFrom] = useState(isoDate(monthAgo));
  const [to, setTo] = useState(isoDate(now));

  const reportQuery = useAttendanceReport(from, to);
  const report = reportQuery.data?.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Relatórios</h1>
        <p className="text-sm text-ink-muted">Análises do período</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="from">De</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-44" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="to">Até</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-44" />
        </div>
      </div>

      {reportQuery.isLoading && <div className="skeleton h-40" />}

      {report && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total de sessões</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-2xl font-medium text-ink">{report.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Realizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-2xl font-medium text-ink">{report.completed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Comparecimento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-2xl font-medium text-accent-strong">
                  {Math.round(report.attendanceRate * 100)}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comparecimento por status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y divide-border">
                {report.byStatus.map((group) => (
                  <div key={group.status} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-ink-muted">{STATUS_LABELS[group.status] ?? group.status}</span>
                    <span className="tabular-nums font-medium text-ink">{group._count}</span>
                  </div>
                ))}
                {report.byStatus.length === 0 && (
                  <p className="py-2 text-sm text-ink-faint">Nenhuma sessão no período.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-ink-faint">
            Exportação em PDF/XLS ainda não disponível para este relatório — em desenvolvimento.
          </p>
        </>
      )}
    </div>
  );
}
