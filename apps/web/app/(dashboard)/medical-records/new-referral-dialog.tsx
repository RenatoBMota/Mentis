'use client';

import { useEffect, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { useAuthToken } from '@/lib/use-auth-token';
import { useCreateReferral, openReferralPdf } from '@/lib/hooks/use-referrals';

const REFERRAL_TYPES = ['Exame', 'Tratamento', 'Encaminhamento para outro profissional', 'Outro'];

interface NewReferralDialogProps {
  patientId: string;
}

/** Encaminhamento (exame, tratamento, outro profissional etc.) gerado a partir da Prontuário. */
export function NewReferralDialog({ patientId }: NewReferralDialogProps) {
  const token = useAuthToken();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(REFERRAL_TYPES[0]);
  const [customType, setCustomType] = useState('');
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createReferral = useCreateReferral(patientId);

  useEffect(() => {
    if (open) {
      setType(REFERRAL_TYPES[0]);
      setCustomType('');
      setRecipient('');
      setContent('');
      setError(null);
    }
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const finalType = type === 'Outro' ? customType.trim() : type;
    if (!finalType) {
      setError('Informe o tipo do encaminhamento.');
      return;
    }

    try {
      const result = await createReferral.mutateAsync({
        type: finalType,
        recipient: recipient || undefined,
        content,
      });
      setOpen(false);
      toast('Encaminhamento salvo. Abrindo documento para impressão…', 'success');
      if (token) {
        await openReferralPdf(result.data.id, token);
      }
    } catch {
      setError('Não foi possível salvar o encaminhamento. Tente novamente.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Send size={16} />
          Encaminhamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo encaminhamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="referralType">Tipo</Label>
            <Select id="referralType" value={type} onChange={(e) => setType(e.target.value)}>
              {REFERRAL_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          {type === 'Outro' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customType">Especifique o tipo</Label>
              <Input
                id="customType"
                required
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="recipient">Destinatário (opcional)</Label>
            <Input
              id="recipient"
              placeholder="Ex.: Dr. João Silva — Psiquiatra"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content">Conteúdo do encaminhamento</Label>
            <Textarea
              id="content"
              required
              rows={6}
              placeholder="Descreva o motivo do encaminhamento e as informações relevantes…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={createReferral.isPending} className="mt-2">
            {createReferral.isPending && <Loader2 size={16} className="animate-spin" />}
            {createReferral.isPending ? 'Salvando…' : 'Salvar e gerar documento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
