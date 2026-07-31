/** Envelope padronizado de resposta da API (PRD 7 — { data, meta, error }). */
export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}
