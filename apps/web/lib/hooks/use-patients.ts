'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { Patient, PatientRecurrenceType } from '@/lib/types';

interface PatientsQuery {
  search?: string;
  status?: string;
}

export function usePatients(query: PatientsQuery = {}) {
  const token = useAuthToken();
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);

  return useQuery({
    queryKey: ['patients', query, token],
    queryFn: () =>
      apiFetch<{ data: Patient[] }>(`/patients?${params.toString()}`, { token: token! }),
    enabled: Boolean(token),
  });
}

export function usePatient(patientId: string | null) {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['patient', patientId, token],
    // GET /patients/:id retorna o paciente "cru" (sem envelope { data }),
    // diferente da maioria dos outros endpoints — comportamento já existente.
    queryFn: () => apiFetch<Patient>(`/patients/${patientId}`, { token: token! }),
    enabled: Boolean(token) && Boolean(patientId),
  });
}

export interface UpdateClinicalInfoInput {
  anamnesis?: string;
  treatmentPlan?: string;
}

export function useUpdatePatientClinicalInfo(patientId: string | null) {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateClinicalInfoInput) =>
      apiFetch<Patient>(`/patients/${patientId}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export interface CreatePatientInput {
  fullName: string;
  age?: number;
  phone: string;
  recurrenceType: PatientRecurrenceType;
  pricePerSession: number;
}

export function useCreatePatient() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePatientInput) =>
      apiFetch<{ data: Patient }>('/patients', {
        method: 'POST',
        body: JSON.stringify(input),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
