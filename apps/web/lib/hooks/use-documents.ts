'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api-client';
import { useAuthToken } from '@/lib/use-auth-token';
import { DocumentCategory, PatientDocument } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

export function useDocuments(patientId: string | null) {
  const token = useAuthToken();

  return useQuery({
    queryKey: ['documents', patientId, token],
    queryFn: () => apiFetch<{ data: PatientDocument[] }>(`/documents/${patientId}`, { token: token! }),
    enabled: Boolean(token) && Boolean(patientId),
  });
}

export interface UploadDocumentInput {
  category: DocumentCategory;
  title: string;
  description?: string;
  file: File;
}

/** Upload é multipart/form-data — não passa por apiFetch (que força JSON). */
export function useUploadDocument(patientId: string | null) {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadDocumentInput): Promise<{ data: PatientDocument }> => {
      if (!token || !patientId) throw new Error('MISSING_AUTH_CONTEXT');

      const formData = new FormData();
      formData.append('category', input.category);
      formData.append('title', input.title);
      if (input.description) formData.append('description', input.description);
      formData.append('file', input.file);

      const response = await fetch(`${API_URL}/documents/${patientId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new ApiError(body.message ?? 'UPLOAD_FAILED', response.status);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
    },
  });
}

export function useDeleteDocument(patientId: string | null) {
  const token = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) =>
      apiFetch(`/documents/${patientId}/${documentId}`, { method: 'DELETE', token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
    },
  });
}

/** Baixa o arquivo (decriptografado no servidor) e dispara o download no navegador. */
export async function downloadDocument(
  patientId: string,
  documentId: string,
  fileName: string,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/documents/${patientId}/${documentId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('DOCUMENT_DOWNLOAD_FAILED');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
