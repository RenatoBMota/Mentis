'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { MedicalRecord } from '@/lib/types';

export function useMedicalRecords(patientId: string | null) {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['medical-records', patientId, token],
    queryFn: () =>
      apiFetch<{ data: MedicalRecord[] }>(`/medical-records/${patientId}`, { token: token! }),
    enabled: Boolean(token) && Boolean(patientId),
  });
}

export interface CreateMedicalRecordInput {
  sessionNumber: number;
  evolutionText: string;
  observations?: string;
  stepsText?: string;
  tags?: string[];
}

export function useCreateMedicalRecord(patientId: string | null) {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMedicalRecordInput) =>
      apiFetch<{ data: MedicalRecord }>(`/medical-records/${patientId}`, {
        method: 'POST',
        body: JSON.stringify(input),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records', patientId] });
    },
  });
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

/** Baixa o PDF do prontuário (não é JSON, então não passa por apiFetch). */
export async function exportMedicalRecordPdf(
  patientId: string,
  reason: string,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/medical-records/${patientId}/export-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error('EXPORT_PDF_FAILED');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const filenameMatch = disposition.match(/filename="(.+)"/);
  const filename = filenameMatch?.[1] ?? 'prontuario.pdf';

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
