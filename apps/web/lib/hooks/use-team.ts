'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { TeamMember, UserRole } from '@/lib/types';

export function useTeam() {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['team', token],
    queryFn: () => apiFetch<{ data: TeamMember[] }>('/team', { token: token! }),
    enabled: Boolean(token),
  });
}

export interface CreateTeamMemberInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export function useCreateTeamMember() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTeamMemberInput) =>
      apiFetch<{ data: TeamMember }>('/team', {
        method: 'POST',
        token: token!,
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  });
}
