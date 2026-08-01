import { AssessmentType } from '@prisma/client';

/** Número de itens e faixa de resposta (0–3) de cada escala validada. */
export const ASSESSMENT_ITEM_COUNT: Record<AssessmentType, number> = {
  PHQ9: 9,
  GAD7: 7,
};

interface SeverityBand {
  max: number;
  label: string;
}

/** Faixas de severidade padrão publicadas para cada instrumento. */
const SEVERITY_BANDS: Record<AssessmentType, SeverityBand[]> = {
  PHQ9: [
    { max: 4, label: 'Mínima' },
    { max: 9, label: 'Leve' },
    { max: 14, label: 'Moderada' },
    { max: 19, label: 'Moderadamente grave' },
    { max: 27, label: 'Grave' },
  ],
  GAD7: [
    { max: 4, label: 'Mínima' },
    { max: 9, label: 'Leve' },
    { max: 14, label: 'Moderada' },
    { max: 21, label: 'Grave' },
  ],
};

export function severityLabel(type: AssessmentType, totalScore: number): string {
  const band = SEVERITY_BANDS[type].find((b) => totalScore <= b.max);
  return band?.label ?? SEVERITY_BANDS[type][SEVERITY_BANDS[type].length - 1].label;
}

/** PHQ-9 item 9 (ideação suicida/autolesão) — qualquer pontuação > 0 é
 * clinicamente relevante independentemente do escore total (item de alerta
 * padrão do instrumento). */
export function hasClinicalAlert(type: AssessmentType, answers: number[]): boolean {
  return type === 'PHQ9' && (answers[8] ?? 0) > 0;
}

export function validateAnswers(type: AssessmentType, answers: number[]): void {
  const expected = ASSESSMENT_ITEM_COUNT[type];
  if (!Array.isArray(answers) || answers.length !== expected) {
    throw new Error(`ANSWERS_LENGTH_MISMATCH: esperado ${expected} respostas para ${type}`);
  }
  for (const value of answers) {
    if (!Number.isInteger(value) || value < 0 || value > 3) {
      throw new Error('ANSWER_OUT_OF_RANGE: cada resposta deve ser um inteiro entre 0 e 3');
    }
  }
}
