'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wallet,
  Wallet2,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/agenda', label: 'Agenda', icon: CalendarDays },
      { href: '/patients', label: 'Pacientes', icon: Users },
      { href: '/medical-records', label: 'Prontuário', icon: FileText },
      { href: '/sessions', label: 'Sessões', icon: ClipboardList },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/financial/office', label: 'Consultório', icon: Wallet },
      { href: '/financial/personal', label: 'Pessoal', icon: Wallet2 },
    ],
  },
  {
    label: 'Análise',
    items: [
      { href: '/reports', label: 'Relatórios', icon: BarChart3 },
      { href: '/settings', label: 'Configurações', icon: Settings },
    ],
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem('psiflow_access_token');
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen bg-ground">
      <aside className="hidden w-56 flex-col border-r border-border bg-surface-raised p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-primary">
            <div className="h-2.5 w-2.5 rounded-full bg-accent-primary" />
          </div>
          <div className="leading-tight">
            <p className="font-serif text-base font-medium text-ink">PsiFlow</p>
            <p className="text-[10px] uppercase tracking-wide text-ink-faint">Sistema Clínico</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wide text-ink-faint">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted hover:bg-surface-base hover:text-ink',
                        active && 'bg-accent-soft font-medium text-accent-strong hover:bg-accent-soft',
                      )}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md border-t border-border px-2 pt-3 text-sm text-ink-muted hover:text-ink"
        >
          <LogOut size={16} />
          Sair
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
