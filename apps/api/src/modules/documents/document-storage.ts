/** Biblioteca Digital: limites e tipos aceitos para upload de arquivos. */
export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
