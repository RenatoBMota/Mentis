import { DocumentCategory } from '@/lib/types';

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  LAUDO: 'Laudo',
  TAREFA_CASA: 'Tarefa de Casa',
  EXERCICIO: 'Exercício',
  OUTRO: 'Outro',
};

export const DOCUMENT_CATEGORIES: DocumentCategory[] = ['LAUDO', 'TAREFA_CASA', 'EXERCICIO', 'OUTRO'];

/** Mesma lista aceita pelo backend (ver document-storage.ts) — mantida em espelho manual. */
export const ACCEPTED_FILE_TYPES =
  '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.txt,application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
