'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
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
import { ApiError } from '@/lib/api-client';
import { ACCEPTED_FILE_TYPES, DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS, formatFileSize } from '@/lib/documents';
import { useUploadDocument } from '@/lib/hooks/use-documents';
import { DocumentCategory } from '@/lib/types';

const ERROR_MESSAGES: Record<string, string> = {
  UNSUPPORTED_FILE_TYPE: 'Tipo de arquivo não suportado. Envie PDF, imagem, Word ou texto.',
  FILE_TOO_LARGE: 'Arquivo maior que o limite de 15 MB.',
  FILE_REQUIRED: 'Selecione um arquivo para enviar.',
};

interface NewDocumentDialogProps {
  patientId: string;
}

/** Biblioteca Digital: anexa laudos, tarefas de casa e exercícios ao paciente. */
export function NewDocumentDialog({ patientId }: NewDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>('LAUDO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadDocument = useUploadDocument(patientId);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setCategory('LAUDO');
      setTitle('');
      setDescription('');
      setFile(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError(ERROR_MESSAGES.FILE_REQUIRED);
      return;
    }

    try {
      await uploadDocument.mutateAsync({ category, title, description: description || undefined, file });
      setOpen(false);
      toast(`"${title}" adicionado à Biblioteca Digital.`, 'success');
    } catch (err) {
      const code = err instanceof ApiError ? err.message : undefined;
      setError((code && ERROR_MESSAGES[code]) ?? 'Não foi possível enviar o arquivo. Tente novamente.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload size={16} />
          Adicionar Arquivo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar à Biblioteca Digital</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="documentCategory">Categoria</Label>
            <Select
              id="documentCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            >
              {DOCUMENT_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {DOCUMENT_CATEGORY_LABELS[option]}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="documentTitle">Título</Label>
            <Input
              id="documentTitle"
              required
              placeholder="Ex.: Laudo neuropsicológico"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="documentDescription">Descrição (opcional)</Label>
            <Textarea
              id="documentDescription"
              rows={3}
              placeholder="Instruções, contexto ou observações para o paciente…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="documentFile">Arquivo</Label>
            <input
              id="documentFile"
              ref={fileInputRef}
              type="file"
              required
              accept={ACCEPTED_FILE_TYPES}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-ink-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-surface-raised file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-surface-raised/80"
            />
            {file && (
              <p className="text-xs text-ink-faint">
                {file.name} · {formatFileSize(file.size)}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={uploadDocument.isPending} className="mt-2">
            {uploadDocument.isPending && <Loader2 size={16} className="animate-spin" />}
            {uploadDocument.isPending ? 'Enviando…' : 'Adicionar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
