'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/lib/hooks/use-notifications';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-raised hover:text-ink"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-status-danger" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-80 rounded-lg border border-border bg-surface-base shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-sm font-medium text-ink">Notificações</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs font-medium text-accent-strong hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-faint">Nenhuma notificação por aqui.</p>
            )}
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => !notification.readAt && markRead.mutate(notification.id)}
                className={cn(
                  'flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-surface-raised',
                  !notification.readAt && 'bg-accent-soft/40',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-ink">
                    {notification.payload.summary ?? 'Notificação do sistema'}
                  </p>
                  {!notification.readAt && (
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary" />
                  )}
                </div>
                <p className="text-xs text-ink-faint">{timeAgo(notification.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
