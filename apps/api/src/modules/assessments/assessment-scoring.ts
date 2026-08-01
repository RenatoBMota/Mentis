import { AssessmentType } from '@prisma/client';

/** Número de itens de cada escala validada. */
export const ASSESSMENT_ITEM_COUNT: Record<AssessmentType, number> = {
  PHQ9: 9,
  GAD7: 7,
  EPDS: 10,
  SRQ20: 20,
  AUDIT: 10,
  PSS10: 10,
  WHO5: 5,
};

/** Valor máximo padrão de resposta por item de cada escala (a maioria usa uma
 * única faixa 0–N para todos os itens; exceções ficam em ITEM_VALUE_OVERRIDES). */
const DEFAULT_MAX_VALUE: Record<AssessmentType, number> = {
  PHQ9: 3,
  GAD7: 3,
  EPDS: 3,
  SRQ20: 1,
  AUDIT: 4,
  PSS10: 4,
  WHO5: 5,
};

/** Itens cujo conjunto de respostas válidas foge da faixa padrão da escala
 * (índice 0-based → valores aceitos). AUDIT itens 9 e 10 (índices 8 e 9)
 * só aceitam 0, 2 ou 4 — não a sequência 0–4 inteira. */
const ITEM_VALUE_OVERRIDES: Partial<Record<AssessmentType, Record<number, number[]>>> = {
  AUDIT: {
    8: [0, 2, 4],
    9: [0, 2, 4],
  },
};

/** Itens com pontuação invertida (resposta alta = melhor, então pontua ao
 * contrário) antes da soma. PSS-10 itens 4, 5, 7 e 8 (índices 3,4,6,7) são
 * redigidos de forma positiva. */
const REVERSE_SCORED_ITEMS: Partial<Record<AssessmentType, number[]>> = {
  PSS10: [3, 4, 6, 7],
};

interface SeverityBand {
  max: number;
  label: string;
  tone: 'success' | 'warning' | 'danger';
}

/**
 * Faixas de severidade/interpretação publicadas para cada instrumento. A
 * ordem é sempre ascendente por totalScore — para WHO-5 (onde nota alta é
 * bom, ao contrário das demais escalas) o tone simplesmente segue a ordem
 * inversa, sem precisar de lógica de comparação diferente.
 */
const SEVERITY_BANDS: Record<AssessmentType, SeverityBand[]> = {
  PHQ9: [
    { max: 4, label: 'Mínima', tone: 'success' },
    { max: 9, label: 'Leve', tone: 'success' },
    { max: 14, label: 'Moderada', tone: 'warning' },
    { max: 19, label: 'Moderadamente grave', tone: 'danger' },
    { max: 27, label: 'Grave', tone: 'danger' },
  ],
  GAD7: [
    { max: 4, label: 'Mínima', tone: 'success' },
    { max: 9, label: 'Leve', tone: 'success' },
    { max: 14, label: 'Moderada', tone: 'warning' },
    { max: 21, label: 'Grave', tone: 'danger' },
  ],
  /** Cutoff clássico de rastreio (Cox et al.): ≥13 = provável depressão pós-parto. */
  EPDS: [
    { max: 8, label: 'Improvável', tone: 'success' },
    { max: 12, label: 'Possível', tone: 'warning' },
    { max: 30, label: 'Provável', tone: 'danger' },
  ],
  /** Cutoff de rastreio de transtorno mental comum usado no Brasil (≥7/8). */
  SRQ20: [
    { max: 6, label: 'Improvável', tone: 'success' },
    { max: 20, label: 'Provável', tone: 'danger' },
  ],
  /** Faixas padrão da OMS para o AUDIT. */
  AUDIT: [
    { max: 7, label: 'Baixo risco', tone: 'success' },
    { max: 15, label: 'Uso de risco', tone: 'warning' },
    { max: 19, label: 'Uso nocivo', tone: 'danger' },
    { max: 40, label: 'Provável dependência', tone: 'danger' },
  ],
  /** Tercis de referência comumente citados na literatura (Cohen et al.). */
  PSS10: [
    { max: 13, label: 'Baixo', tone: 'success' },
    { max: 26, label: 'Moderado', tone: 'warning' },
    { max: 40, label: 'Alto', tone: 'danger' },
  ],
  /** Score já em percentual (0–100). ≤50 sugere avaliar depressão (guia OMS). */
  WHO5: [
    { max: 28, label: 'Muito baixo — recomenda-se avaliação adicional', tone: 'danger' },
    { max: 50, label: 'Baixo', tone: 'warning' },
    { max: 75, label: 'Moderado', tone: 'success' },
    { max: 100, label: 'Bom', tone: 'success' },
  ],
};

export function severityLabel(type: AssessmentType, totalScore: number): string {
  return findBand(type, totalScore).label;
}

export function severityTone(type: AssessmentType, totalScore: number): 'success' | 'warning' | 'danger' {
  return findBand(type, totalScore).tone;
}

function findBand(type: AssessmentType, totalScore: number): SeverityBand {
  const bands = SEVERITY_BANDS[type];
  return bands.find((b) => totalScore <= b.max) ?? bands[bands.length - 1];
}

/**
 * Item de alerta clínico de cada escala (ideação suicida/autolesão),
 * verificado independentemente do escore total: PHQ-9 item 9 (índice 8),
 * EPDS item 10 (índice 9), SRQ-20 item 20 (índice 19). As demais escalas
 * não têm um item equivalente.
 */
const CLINICAL_ALERT_ITEM_INDEX: Partial<Record<AssessmentType, number>> = {
  PHQ9: 8,
  EPDS: 9,
  SRQ20: 19,
};

export function hasClinicalAlert(type: AssessmentType, answers: number[]): boolean {
  const index = CLINICAL_ALERT_ITEM_INDEX[type];
  return index !== undefined && (answers[index] ?? 0) > 0;
}

/** Soma as respostas aplicando inversão de itens (PSS-10) e o multiplicador
 * de percentual do WHO-5 — nunca uma soma simples e direta para todo tipo. */
export function computeTotalScore(type: AssessmentType, answers: number[]): number {
  const reversed = new Set(REVERSE_SCORED_ITEMS[type] ?? []);
  const maxValue = DEFAULT_MAX_VALUE[type];
  const raw = answers.reduce((sum, value, index) => sum + (reversed.has(index) ? maxValue - value : value), 0);
  return type === 'WHO5' ? raw * 4 : raw;
}

export function validateAnswers(type: AssessmentType, answers: number[]): void {
  const expected = ASSESSMENT_ITEM_COUNT[type];
  if (!Array.isArray(answers) || answers.length !== expected) {
    throw new Error(`ANSWERS_LENGTH_MISMATCH: esperado ${expected} respostas para ${type}`);
  }

  const overrides = ITEM_VALUE_OVERRIDES[type];
  const defaultMax = DEFAULT_MAX_VALUE[type];

  answers.forEach((value, index) => {
    if (!Number.isInteger(value)) {
      throw new Error('ANSWER_OUT_OF_RANGE: cada resposta deve ser um número inteiro');
    }
    const allowed = overrides?.[index];
    const valid = allowed ? allowed.includes(value) : value >= 0 && value <= defaultMax;
    if (!valid) {
      throw new Error('ANSWER_OUT_OF_RANGE: resposta fora do intervalo permitido para este item');
    }
  });
}
