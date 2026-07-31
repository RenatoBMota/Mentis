'use client';

import { useQuery } from '@tanstack/react-query';
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
