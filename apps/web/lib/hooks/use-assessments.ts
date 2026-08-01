'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { Assessment } from '@/lib/types';
import { AssessmentType } from '@/lib/assessments';

export function useAssessments(patientId: string | null) {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['assessments', patientId, token],
    queryFn: () => apiFetch<{ data: Assessment[] }>(`/assessments/${patientId}`, { token: token! }),
    enabled: Boolean(token) && Boolean(patientId),
  });
}

export interface CreateAssessmentInput {
  type: AssessmentType;
  answers: number[];
}

export function useCreateAssessment(patientId: string | null) {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAssessmentInput) =>
      apiFetch<{ data: Assessment }>(`/assessments/${patientId}`, {
        method: 'POST',
        body: JSON.stringify(input),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', patientId] });
    },
  });
}
