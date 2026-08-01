export type AssessmentType = 'PHQ9' | 'GAD7';

export const ASSESSMENT_LABELS: Record<AssessmentType, string> = {
  PHQ9: 'PHQ-9 (Depressão)',
  GAD7: 'GAD-7 (Ansiedade)',
};

export const ANSWER_OPTIONS = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Vários dias' },
  { value: 2, label: 'Mais da metade dos dias' },
  { value: 3, label: 'Quase todos os dias' },
];

/** PHQ-9 — Patient Health Questionnaire-9 (Kroenke, Spitzer & Williams, 2001). */
export const PHQ9_QUESTIONS = [
  'Pouco interesse ou prazer em fazer as coisas',
  'Se sentir para baixo, deprimido(a) ou sem esperança',
  'Dificuldade para pegar no sono ou permanecer dormindo, ou dormir demais',
  'Sentir-se cansado(a) ou com pouca energia',
  'Falta de apetite ou comer demais',
  'Sentir-se mal consigo mesmo(a) — ou que é um fracasso ou que decepcionou sua família ou você mesmo(a)',
  'Dificuldade de concentração nas coisas, como ler o jornal ou ver televisão',
  'Lentidão para se movimentar ou falar, a ponto de outras pessoas notarem — ou o oposto, estar tão agitado(a) que se movimenta muito mais que o normal',
  'Pensamento de que seria melhor estar morto(a) ou de se machucar de alguma forma',
];

/** GAD-7 — Generalized Anxiety Disorder-7 (Spitzer, Kroenke, Williams & Löwe, 2006). */
export const GAD7_QUESTIONS = [
  'Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)',
  'Não ser capaz de impedir ou controlar as preocupações',
  'Preocupar-se muito com diversas coisas',
  'Dificuldade para relaxar',
  'Ficar tão agitado(a) que se torna difícil permanecer sentado(a)',
  'Ficar facilmente aborrecido(a) ou irritado(a)',
  'Sentir medo como se algo terrível fosse acontecer',
];

export const ASSESSMENT_QUESTIONS: Record<AssessmentType, string[]> = {
  PHQ9: PHQ9_QUESTIONS,
  GAD7: GAD7_QUESTIONS,
};

export const ASSESSMENT_MAX_SCORE: Record<AssessmentType, number> = {
  PHQ9: 27,
  GAD7: 21,
};
