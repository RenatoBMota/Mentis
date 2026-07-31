'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { FinancialScope, FinancialTransaction, FinancialTransactionType } from '@/lib/types';

export function useTransactions(year?: number, month?: number) {
  const token = useAuthToken();
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));

  return useQuery({
    queryKey: ['financial-transactions', year, month, token],
    queryFn: () =>
      apiFetch<{ data: FinancialTransaction[] }>(`/financial/transactions?${params.toString()}`, {
        token: token!,
      }),
    enabled: Boolean(token),
  });
}

export function useReceivablesForecast() {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['receivables-forecast', token],
    queryFn: () =>
      apiFetch<{ data: { total: number } }>('/financial/receivables-forecast', { token: token! }),
    enabled: Boolean(token),
  });
}

export interface CreateTransactionInput {
  type: FinancialTransactionType;
  scope: FinancialScope;
  category: string;
  amount: number;
  dueDate: string;
  recurring?: boolean;
}

export function useCreateTransaction() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      apiFetch<{ data: FinancialTransaction }>('/financial/transactions', {
        method: 'POST',
        body: JSON.stringify(input),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-forecast'] });
    },
  });
}
