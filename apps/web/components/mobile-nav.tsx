'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogout } from '@/lib/use-logout';
import { NAV_GROUPS } from './nav-groups';

/** Menu de navegação em drawer para telas pequenas — a sidebar fica oculta abaixo de md. */
export function MobileNav() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger className="flex items-center justify-center rounded-md p-1.5 text-ink-muted hover:bg-surface-raised hover:text-ink md:hidden">
        <Menu size={20} />
        <span className="sr-only">Abrir menu</span>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm md:hidden" />
        <DialogPrimitive.Content
          className="fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border bg-surface-raised p-4 md:hidden"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Menu de navegação</DialogPrimitive.Title>
          <div className="mb-6 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-primary">
                <div className="h-2.5 w-2.5 rounded-full bg-accent-primary" />
              </div>
              <div className="leading-tight">
                <p className="font-serif text-base font-medium text-ink">Mentis</p>
                <p className="text-[10px] uppercase tracking-wide text-ink-faint">Sistema Clínico</p>
              </div>
            </div>
            <DialogPrimitive.Close className="text-ink-faint hover:text-ink">
              <X size={18} />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
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
                      <DialogPrimitive.Close key={href} asChild>
                        <Link
                          href={href}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted hover:bg-surface-base hover:text-ink',
                            active && 'bg-accent-soft font-medium text-accent-strong hover:bg-accent-soft',
                          )}
                        >
                          <Icon size={16} />
                          {label}
                        </Link>
                      </DialogPrimitive.Close>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-md border-t border-border px-2 pt-3 text-sm text-ink-muted hover:text-ink"
          >
            <LogOut size={16} />
            Sair
          </button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
