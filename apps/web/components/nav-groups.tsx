import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  Wallet2,
  BarChart3,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
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
