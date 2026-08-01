'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { UserProfile } from '@/lib/types';

export function useProfile() {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['profile', token],
    queryFn: () => apiFetch<{ data: UserProfile }>('/auth/me', { token: token! }),
    enabled: Boolean(token),
  });
}

export interface UpdateProfileInput {
  name?: string;
  crp?: string;
  phone?: string;
  pixKey?: string;
}

export function useUpdateProfile() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      apiFetch<{ data: UserProfile }>('/auth/me', {
        method: 'PATCH',
        token: token!,
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  const token = useAuthToken();

  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      apiFetch<void>('/auth/change-password', {
        method: 'POST',
        token: token!,
        body: JSON.stringify(input),
      }),
  });
}
