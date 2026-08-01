'use client';

import { useMemo, useState } from 'react';
import { Download, File, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS, formatFileSize } from '@/lib/documents';
import { downloadDocument, useDeleteDocument, useDocuments } from '@/lib/hooks/use-documents';
import { useAuthToken } from '@/lib/use-auth-token';
import { DocumentCategory, PatientDocument } from '@/lib/types';
import { NewDocumentDialog } from './new-document-dialog';

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon size={16} className="text-ink-faint" />;
  if (mimeType === 'application/pdf' || mimeType.includes('word')) {
    return <FileText size={16} className="text-ink-faint" />;
  }
  return <File size={16} className="text-ink-faint" />;
}

interface LibraryPanelProps {
  patientId: string;
}

/** Biblioteca Digital: laudos, tarefas de casa e exercícios anexados ao paciente. */
export function LibraryPanel({ patientId }: LibraryPanelProps) {
  const documentsQuery = useDocuments(patientId);
  const documents = useMemo(() => documentsQuery.data?.data ?? [], [documentsQuery.data]);
  const deleteDocument = useDeleteDocument(patientId);
  const token = useAuthToken();
  const { toast } = useToast();

  const [pendingDelete, setPendingDelete] = useState<PatientDocument | null>(null);

  const byCategory = useMemo(() => {
    const map = new Map<DocumentCategory, PatientDocument[]>();
    for (const category of DOCUMENT_CATEGORIES) {
      map.set(
        category,
        documents.filter((d) => d.category === category),
      );
    }
    return map;
  }, [documents]);

  async function handleDownload(doc: PatientDocument) {
    if (!token) return;
    try {
      await downloadDocument(patientId, doc.id, doc.fileName, token);
    } catch {
      toast('Não foi possível baixar o arquivo. Tente novamente.', 'error');
    }
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteDocument.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast(`"${pendingDelete.title}" removido da Biblioteca Digital.`, 'success');
        setPendingDelete(null);
      },
      onError: () => {
        toast('Não foi possível remover o arquivo. Tente novamente.', 'error');
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Biblioteca Digital</CardTitle>
          <NewDocumentDialog patientId={patientId} />
        </div>
      </CardHeader>
      <CardContent>
        {documentsQuery.isLoading && <div className="skeleton h-24" />}

        {!documentsQuery.isLoading && documents.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhum arquivo adicionado ainda.</p>
        )}

        {!documentsQuery.isLoading && documents.length > 0 && (
          <div className="flex flex-col gap-5">
            {DOCUMENT_CATEGORIES.map((category) => {
              const items = byCategory.get(category) ?? [];
              if (items.length === 0) return null;
              return (
                <div key={category} className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-ink">{DOCUMENT_CATEGORY_LABELS[category]}</p>
                  <div className="flex flex-col divide-y divide-border">
                    {items.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <div className="mt-0.5">
                            <FileTypeIcon mimeType={doc.mimeType} />
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <p className="truncate text-sm font-medium text-ink">{doc.title}</p>
                            {doc.description && (
                              <p className="truncate text-xs text-ink-muted">{doc.description}</p>
                            )}
                            <p className="text-xs text-ink-faint">
                              {formatFileSize(doc.fileSize)} ·{' '}
                              {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                            <Download size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPendingDelete(doc)}
                            className="text-status-danger hover:bg-status-danger/10"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remover arquivo"
        description={
          pendingDelete ? `Remover "${pendingDelete.title}" da Biblioteca Digital? Essa ação não pode ser desfeita.` : ''
        }
        confirmLabel="Remover"
        destructive
        loading={deleteDocument.isPending}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
}
