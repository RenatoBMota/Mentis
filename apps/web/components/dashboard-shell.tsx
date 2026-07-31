'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, LayoutDashboard, Users, Wallet, FileText, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/financial', label: 'Financeiro', icon: Wallet },
  { href: '/medical-records', label: 'Prontuário', icon: FileText },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem('psiflow_access_token');
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen bg-surface-base">
      <aside className="hidden w-56 flex-col border-r border-white/10 bg-surface-raised/40 p-4 md:flex">
        <p className="mb-6 px-2 text-lg font-bold text-slate-50">PsiFlow</p>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-slate-50',
                  active && 'bg-accent-highlight/10 text-accent-highlight',
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-50"
        >
          <LogOut size={16} />
          Sair
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
