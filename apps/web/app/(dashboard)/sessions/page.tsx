'use client';

import { useMemo, useState } from 'react';
import { MapPin, MessageCircle, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSessions, useCompleteAppointment, useSendChargeLink, useMarkSessionPaid } from '@/lib/hooks/use-sessions';
import { usePatients } from '@/lib/hooks/use-patients';
import { AppointmentStatus } from '@/lib/types';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_TABS: { label: string; value: AppointmentStatus | undefined }[] = [
  { label: 'Todas', value: undefined },
  { label: 'Realizadas', value: 'COMPLETED' },
  { label: 'Agendadas', value: 'SCHEDULED' },
  { label: 'Confirmadas', value: 'CONFIRMED' },
  { label: 'Faltou', value: 'NO_SHOW' },
  { label: 'Canceladas', value: 'CANCELED' },
];

const PAYMENT_LABELS: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  PAID: { label: 'Pago', tone: 'success' },
  PENDING: { label: 'Pendente', tone: 'warning' },
  OVERDUE: { label: 'Atrasado', tone: 'danger' },
};

/** Histórico de Sessões & Cobrança WhatsApp (PRD 9.7) — funcionalidade-chave do produto. */
export default function SessionsPage() {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | undefined>(undefined);
  const [patientId, setPatientId] = useState('');

  const sessionsQuery = useSessions({ status: statusFilter, patientId: patientId || undefined });
  const patientsQuery = usePatients();
  const completeAppointment = useCompleteAppointment();
  const sendChargeLink = useSendChargeLink();
  const markPaid = useMarkSessionPaid();

  const rows = useMemo(() => sessionsQuery.data?.data ?? [], [sessionsQuery.data]);
  const meta = sessionsQuery.data?.meta;
  const patients = patientsQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Sessões</h1>
        <p className="text-sm text-ink-muted">Histórico de atendimentos</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium text-ink-muted hover:text-ink',
                statusFilter === tab.value
                  ? 'border-accent-primary bg-accent-soft text-accent-strong'
                  : 'border-border',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-56">
          <option value="">Todos os pacientes</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.fullName}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-2xl font-medium text-ink">{meta?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-2xl font-medium text-ink">{meta?.completed ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Comparecimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-2xl font-medium text-accent-strong">
              {meta?.attendanceRate != null ? `${Math.round(meta.attendanceRate * 100)}%` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {sessionsQuery.isLoading && <div className="skeleton m-4 h-24" />}
          {!sessionsQuery.isLoading && rows.length === 0 && (
            <p className="p-4 text-sm text-ink-muted">Nenhuma sessão encontrada.</p>
          )}
          {rows.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-semibold">Data/Hora</th>
                  <th className="px-4 py-3 font-semibold">Paciente</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Valor</th>
                  <th className="px-4 py-3 font-semibold">Pagamento</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const payment = row.sessionRecord ? PAYMENT_LABELS[row.sessionRecord.paymentStatus] : null;
                  const needsCompletion = row.status === 'SCHEDULED' || row.status === 'CONFIRMED';
                  return (
                    <tr key={row.id} className="border-b border-border last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                        {new Date(row.dateTime).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{row.patient.fullName}</td>
                      <td className="px-4 py-3 text-ink-muted">
                        <span className="inline-flex items-center gap-1">
                          {row.modality === 'ONLINE' ? <Video size={13} /> : <MapPin size={13} />}
                          {row.modality === 'ONLINE' ? 'Online' : 'Presencial'}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-ink">{currency.format(Number(row.price))}</td>
                      <td className="px-4 py-3">
                        {payment ? (
                          <Badge tone={payment.tone}>{payment.label}</Badge>
                        ) : (
                          <span className="text-xs text-ink-faint">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {needsCompletion && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={completeAppointment.isPending}
                              onClick={() => completeAppointment.mutate(row.id)}
                            >
                              Marcar como realizada
                            </Button>
                          )}
                          {row.sessionRecord && row.sessionRecord.paymentStatus !== 'PAID' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={sendChargeLink.isPending}
                                onClick={() => sendChargeLink.mutate(row.sessionRecord!.id)}
                              >
                                <MessageCircle size={13} />
                                Cobrar
                              </Button>
                              <Button
                                size="sm"
                                disabled={markPaid.isPending}
                                onClick={() =>
                                  markPaid.mutate({
                                    sessionRecordId: row.sessionRecord!.id,
                                    paymentMethod: 'PIX',
                                  })
                                }
                              >
                                Marcar como pago
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
