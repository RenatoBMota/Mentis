'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/lib/hooks/use-profile';

const PLAN_LABELS: Record<string, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  CLINIC: 'Clínica',
};

const ROLE_LABELS: Record<string, string> = {
  PROFESSIONAL: 'Profissional (owner)',
  RECEPTIONIST: 'Recepcionista',
  SUPERVISOR: 'Supervisor Clínico',
};

/** Configurações — perfil do usuário autenticado. */
export default function SettingsPage() {
  const profileQuery = useProfile();
  const profile = profileQuery.data?.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Configurações</h1>
        <p className="text-sm text-ink-muted">Dados da sua conta</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Perfil profissional</CardTitle>
        </CardHeader>
        <CardContent>
          {profileQuery.isLoading && <div className="skeleton h-40" />}
          {profile && (
            <dl className="flex flex-col divide-y divide-border text-sm">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-muted">Nome</dt>
                <dd className="font-medium text-ink">{profile.name}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-muted">E-mail</dt>
                <dd className="font-medium text-ink">{profile.email}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-muted">CRP</dt>
                <dd className="font-medium text-ink">{profile.crp ?? '—'}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-muted">Telefone</dt>
                <dd className="font-medium text-ink">{profile.phone ?? '—'}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-muted">Chave Pix</dt>
                <dd className="font-medium text-ink">{profile.pixKey ?? '—'}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-muted">Papel</dt>
                <dd className="font-medium text-ink">{ROLE_LABELS[profile.role] ?? profile.role}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-ink-muted">Plano</dt>
                <dd className="font-medium text-ink">{PLAN_LABELS[profile.planType] ?? profile.planType}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-ink-faint">Edição de perfil ainda não disponível — em desenvolvimento.</p>
    </div>
  );
}
