'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { AppointmentStatus } from '@/lib/types';

interface AttendanceReport {
  from: string;
  to: string;
  total: number;
  completed: number;
  attendanceRate: number;
  byStatus: { status: AppointmentStatus; _count: number }[];
}

export function useAttendanceReport(from: string, to: string) {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['attendance-report', from, to, token],
    queryFn: () =>
      apiFetch<{ data: AttendanceReport }>(`/reports/attendance?from=${from}&to=${to}`, {
        token: token!,
      }),
    enabled: Boolean(token) && Boolean(from) && Boolean(to),
  });
}
