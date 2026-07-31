import Link from 'next/link';
import { CalendarDays, LayoutDashboard, Users, Wallet, FileText } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/financial', label: 'Financeiro', icon: Wallet },
  { href: '/medical-records', label: 'Prontuário', icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-base">
      <aside className="hidden w-56 flex-col border-r border-white/10 bg-surface-raised/40 p-4 md:flex">
        <p className="mb-6 px-2 text-lg font-bold text-slate-50">PsiFlow</p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-slate-50"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
