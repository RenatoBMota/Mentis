'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';
import { designTokens } from '@/lib/design-tokens';

/** Tela de Autenticação (PRD 9.2). */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { accessToken } = await apiFetch<{ accessToken: string; refreshToken: string }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );
      localStorage.setItem('psiflow_access_token', accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? 'E-mail ou senha inválidos.' : 'Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: `radial-gradient(640px 320px at 18% 0%, ${designTokens.accent.soft}, transparent 60%), ${designTokens.ground}`,
      }}
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface-base p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-accent-primary">
            <div className="h-3.5 w-3.5 rounded-full bg-accent-primary" />
          </div>
          <h1 className="font-serif text-2xl font-medium text-ink">PsiFlow</h1>
          <p className="mt-1 text-sm text-ink-muted">Acesse sua conta clínica</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail ou usuário</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-status-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Entrar no sistema
          </Button>
        </form>

        <footer className="mt-8 border-t border-border pt-4 text-center text-xs text-ink-faint">
          Dra. Mariana Souza • Psicóloga Clínica • CRP 06/123456
        </footer>
      </div>
    </main>
  );
}
