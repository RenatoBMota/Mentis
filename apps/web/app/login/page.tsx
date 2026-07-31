'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, ApiError } from '@/lib/api-client';

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
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-surface-raised/70 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-50">PsiFlow</h1>
          <p className="mt-1 text-sm text-slate-400">Acesse sua conta clínica</p>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
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

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          Dra. Mariana Souza • Psicóloga Clínica • CRP 06/123456
        </footer>
      </div>
    </main>
  );
}
