'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { AppNotification } from '@/lib/types';

export function useNotifications() {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['notifications', token],
    queryFn: () =>
      apiFetch<{ data: AppNotification[]; unreadCount: number }>('/notifications', { token: token! }),
    enabled: Boolean(token),
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/notifications/${id}/read`, { method: 'PATCH', token: token! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch('/notifications/read-all', { method: 'PATCH', token: token! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
