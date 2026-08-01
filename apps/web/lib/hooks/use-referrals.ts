'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { Referral } from '@/lib/types';

export function useReferrals(patientId: string | null) {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['referrals', patientId, token],
    queryFn: () => apiFetch<{ data: Referral[] }>(`/referrals/${patientId}`, { token: token! }),
    enabled: Boolean(token) && Boolean(patientId),
  });
}

export interface CreateReferralInput {
  type: string;
  recipient?: string;
  content: string;
}

export function useCreateReferral(patientId: string | null) {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReferralInput) =>
      apiFetch<{ data: Referral }>(`/referrals/${patientId}`, {
        method: 'POST',
        body: JSON.stringify(input),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals', patientId] });
    },
  });
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

/** Abre o PDF do encaminhamento numa nova aba, pronta para o profissional imprimir. */
export async function openReferralPdf(referralId: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/referrals/pdf/${referralId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('REFERRAL_PDF_FAILED');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Revoga depois de um tempo generoso para a aba ter carregado o PDF.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
