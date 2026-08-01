'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';

export interface TrendPoint {
  date: string;
  revenue: number;
  scheduled: number;
  completed: number;
}

export function useDashboardTrend(days = 30) {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['dashboard-trend', days, token],
    queryFn: () => apiFetch<{ data: TrendPoint[] }>(`/dashboard/trend?days=${days}`, { token: token! }),
    enabled: Boolean(token),
  });
}
