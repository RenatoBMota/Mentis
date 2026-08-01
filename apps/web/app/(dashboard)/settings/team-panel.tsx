'use client';

import { useEffect, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import { useCreateTeamMember, useTeam } from '@/lib/hooks/use-team';
import { UserRole } from '@/lib/types';

const ROLE_LABELS: Record<UserRole, string> = {
  PROFESSIONAL: 'Profissional (owner)',
  RECEPTIONIST: 'Recepcionista',
  SUPERVISOR: 'Supervisor Clínico',
};

const ROLES: UserRole[] = ['RECEPTIONIST', 'SUPERVISOR', 'PROFESSIONAL'];

/** Gestão de equipe — só o Profissional (owner) vê e cadastra novos usuários do consultório/clínica. */
export function TeamPanel() {
  const teamQuery = useTeam();
  const members = teamQuery.data?.data ?? [];

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Equipe</CardTitle>
          <NewTeamMemberDialog />
        </div>
      </CardHeader>
      <CardContent>
        {teamQuery.isLoading && <div className="skeleton h-24" />}

        {!teamQuery.isLoading && members.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum outro usuário cadastrado ainda.</p>
        )}

        {!teamQuery.isLoading && members.length > 0 && (
          <div className="flex flex-col divide-y divide-border text-sm">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2.5">
                <div className="flex flex-col">
                  <span className="font-medium text-ink">{member.name}</span>
                  <span className="text-xs text-ink-faint">{member.email}</span>
                </div>
                <span className="text-xs text-ink-muted">{ROLE_LABELS[member.role]}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NewTeamMemberDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('RECEPTIONIST');
  const [error, setError] = useState<string | null>(null);

  const createMember = useCreateTeamMember();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setPassword('');
      setRole('RECEPTIONIST');
      setError(null);
    }
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await createMember.mutateAsync({ name, email, password, role });
      setOpen(false);
      toast(`${name} foi adicionado(a) à equipe.`, 'success');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Já existe um usuário com esse e-mail.');
      } else {
        setError('Não foi possível cadastrar o usuário. Tente novamente.');
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus size={14} />
          Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar usuário à equipe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memberName">Nome</Label>
            <Input id="memberName" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memberEmail">E-mail</Label>
            <Input
              id="memberEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memberPassword">Senha inicial</Label>
            <Input
              id="memberPassword"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-ink-faint">
              Combine essa senha com a pessoa — ela pode trocá-la depois em Configurações.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memberRole">Papel</Label>
            <Select id="memberRole" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {ROLES.map((option) => (
                <option key={option} value={option}>
                  {ROLE_LABELS[option]}
                </option>
              ))}
            </Select>
          </div>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={createMember.isPending} className="mt-2">
            {createMember.isPending && <Loader2 size={16} className="animate-spin" />}
            {createMember.isPending ? 'Cadastrando…' : 'Adicionar à equipe'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
