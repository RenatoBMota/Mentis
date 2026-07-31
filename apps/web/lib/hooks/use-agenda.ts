'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { Appointment, AppointmentModality } from '@/lib/types';

export function useWeeklyAgenda(weekStart: Date) {
  const token = useAuthToken();
  const weekStartIso = weekStart.toISOString();

  return useQuery({
    queryKey: ['agenda-weekly', weekStartIso, token],
    queryFn: () =>
      apiFetch<{ data: Appointment[] }>(`/agenda/weekly?weekStart=${weekStartIso}`, {
        token: token!,
      }),
    enabled: Boolean(token),
  });
}

export interface CreateAppointmentInput {
  patientId: string;
  dateTime: string;
  modality: AppointmentModality;
  price: number;
}

export function useCreateAppointment() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAppointmentInput) =>
      apiFetch<{ data: Appointment }>('/agenda/appointments', {
        method: 'POST',
        body: JSON.stringify(input),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda-weekly'] });
    },
  });
}
