'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import { useChangePassword, useProfile, useUpdateProfile } from '@/lib/hooks/use-profile';
import { TeamPanel } from './team-panel';

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

/** Configurações — perfil do usuário autenticado, editável, com troca de senha. */
export default function SettingsPage() {
  const profileQuery = useProfile();
  const profile = profileQuery.data?.data;
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', crp: '', phone: '', pixKey: '' });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  function startEditing() {
    if (!profile) return;
    setForm({
      name: profile.name ?? '',
      crp: profile.crp ?? '',
      phone: profile.phone ?? '',
      pixKey: profile.pixKey ?? '',
    });
    setEditing(true);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    try {
      await updateProfile.mutateAsync(form);
      toast('Perfil atualizado com sucesso.', 'success');
      setEditing(false);
    } catch {
      toast('Não foi possível salvar as alterações. Tente novamente.', 'error');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Configurações</h1>
        <p className="text-sm text-ink-muted">Dados da sua conta</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Perfil profissional</CardTitle>
            {profile && !editing && (
              <Button variant="outline" size="sm" onClick={startEditing}>
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {profileQuery.isLoading && <div className="skeleton h-40" />}

          {profile && !editing && (
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

          {profile && editing && (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="crp">CRP</Label>
                <Input
                  id="crp"
                  value={form.crp}
                  onChange={(e) => setForm((f) => ({ ...f, crp: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pixKey">Chave Pix</Label>
                <Input
                  id="pixKey"
                  value={form.pixKey}
                  onChange={(e) => setForm((f) => ({ ...f, pixKey: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? 'Salvando…' : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">Altere a senha usada para acessar sua conta.</p>
          <Button variant="outline" size="sm" onClick={() => setPasswordDialogOpen(true)}>
            Trocar senha
          </Button>
        </CardContent>
      </Card>

      {profile?.role === 'PROFESSIONAL' && <TeamPanel />}

      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </div>
  );
}

function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const changePassword = useChangePassword();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('A confirmação não corresponde à nova senha.');
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast('Senha alterada com sucesso.', 'success');
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? 'Senha atual incorreta.' : 'Não foi possível trocar a senha.');
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trocar senha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={changePassword.isPending} className="mt-2">
            {changePassword.isPending ? 'Alterando…' : 'Trocar senha'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
