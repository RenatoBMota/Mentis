'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthToken } from '@/lib/use-auth-token';

/** Redireciona para /login quando não há sessão ativa. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthToken();

  useEffect(() => {
    if (token === null) {
      router.replace('/login');
    }
  }, [token, router]);

  if (token === undefined || token === null) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-ink-faint" size={24} />
      </div>
    );
  }

  return <>{children}</>;
}
