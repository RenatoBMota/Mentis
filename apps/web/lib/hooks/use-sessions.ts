'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { AppointmentStatus, SessionRow } from '@/lib/types';

interface SessionsMeta {
  total: number;
  completed: number;
  noShow: number;
  attendanceRate: number | null;
}

interface SessionsQuery {
  status?: AppointmentStatus;
  patientId?: string;
}

export function useSessions(query: SessionsQuery = {}) {
  const token = useAuthToken();
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.patientId) params.set('patientId', query.patientId);

  return useQuery({
    queryKey: ['sessions', query, token],
    queryFn: () =>
      apiFetch<{ data: SessionRow[]; meta: SessionsMeta }>(`/sessions?${params.toString()}`, {
        token: token!,
      }),
    enabled: Boolean(token),
  });
}

function useInvalidateSessions() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    queryClient.invalidateQueries({ queryKey: ['agenda-weekly'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
  };
}

export function useCompleteAppointment() {
  const token = useAuthToken();
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      apiFetch(`/sessions/${appointmentId}/complete`, { method: 'PATCH', token: token! }),
    onSuccess: invalidate,
  });
}

export function useSendChargeLink() {
  const token = useAuthToken();
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: (sessionRecordId: string) =>
      apiFetch('/whatsapp/send-charge-link', {
        method: 'POST',
        body: JSON.stringify({ sessionRecordId }),
        token: token!,
      }),
    onSuccess: invalidate,
  });
}

export function useMarkSessionPaid() {
  const token = useAuthToken();
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: ({ sessionRecordId, paymentMethod }: { sessionRecordId: string; paymentMethod: string }) =>
      apiFetch(`/financial/sessions/${sessionRecordId}/mark-paid`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentMethod }),
        token: token!,
      }),
    onSuccess: invalidate,
  });
}
