'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthToken } from '@/lib/use-auth-token';
import { exportMedicalRecordPdf } from '@/lib/hooks/use-medical-records';

/** RF-06: exportação exige justificativa, registrada em AuditLog. */
export function ExportPdfDialog({ patientId }: { patientId: string }) {
  const token = useAuthToken();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await exportMedicalRecordPdf(patientId, reason, token);
      setOpen(false);
      setReason('');
    } catch {
      setError('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download size={16} />
          Exportar PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar prontuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Justificativa (obrigatória, registrada em auditoria)</Label>
            <Textarea
              id="reason"
              required
              minLength={5}
              rows={3}
              placeholder="Ex.: compartilhamento autorizado com supervisor clínico"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-status-danger">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Gerar PDF
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
