export type AssessmentType = 'PHQ9' | 'GAD7' | 'EPDS' | 'SRQ20' | 'AUDIT' | 'PSS10' | 'WHO5';

export interface AssessmentOption {
  value: number;
  label: string;
}

export interface AssessmentQuestion {
  text: string;
  options: AssessmentOption[];
}

export const ASSESSMENT_LABELS: Record<AssessmentType, string> = {
  PHQ9: 'PHQ-9 (Depressão)',
  GAD7: 'GAD-7 (Ansiedade)',
  EPDS: 'EPDS (Depressão Pós-Parto)',
  SRQ20: 'SRQ-20 (Rastreio Geral)',
  AUDIT: 'AUDIT (Uso de Álcool)',
  PSS10: 'PSS-10 (Estresse Percebido)',
  WHO5: 'WHO-5 (Bem-Estar)',
};

/** Texto de instrução exibido no topo do formulário — o período de referência varia por escala. */
export const ASSESSMENT_INTRO: Record<AssessmentType, string> = {
  PHQ9: 'Nas últimas 2 semanas, com que frequência você foi incomodado(a) pelos problemas abaixo?',
  GAD7: 'Nas últimas 2 semanas, com que frequência você foi incomodado(a) pelos problemas abaixo?',
  EPDS: 'Como você tem se sentido nos últimos 7 dias, não só hoje.',
  SRQ20: 'Nos últimos 30 dias, você teve algum dos problemas abaixo?',
  AUDIT: 'Responda considerando seu padrão de consumo de álcool.',
  PSS10: 'No último mês, com que frequência você se sentiu ou pensou da forma descrita?',
  WHO5: 'Nas últimas 2 semanas, cada uma das afirmações se aplicou a você...',
};

export const ASSESSMENT_MAX_SCORE: Record<AssessmentType, number> = {
  PHQ9: 27,
  GAD7: 21,
  EPDS: 30,
  SRQ20: 20,
  AUDIT: 40,
  PSS10: 40,
  WHO5: 100,
};

const FREQUENCY_2_WEEKS: AssessmentOption[] = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Vários dias' },
  { value: 2, label: 'Mais da metade dos dias' },
  { value: 3, label: 'Quase todos os dias' },
];

const YES_NO: AssessmentOption[] = [
  { value: 0, label: 'Não' },
  { value: 1, label: 'Sim' },
];

const FREQUENCY_MONTH: AssessmentOption[] = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Quase nunca' },
  { value: 2, label: 'Às vezes' },
  { value: 3, label: 'Frequentemente' },
  { value: 4, label: 'Muito frequentemente' },
];

const TIME_2_WEEKS: AssessmentOption[] = [
  { value: 0, label: 'Em nenhum momento' },
  { value: 1, label: 'Pouco tempo' },
  { value: 2, label: 'Menos da metade do tempo' },
  { value: 3, label: 'Mais da metade do tempo' },
  { value: 4, label: 'A maior parte do tempo' },
  { value: 5, label: 'Todo o tempo' },
];

const AUDIT_FREQUENCY: AssessmentOption[] = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Menos que mensalmente' },
  { value: 2, label: 'Mensalmente' },
  { value: 3, label: 'Semanalmente' },
  { value: 4, label: 'Todos ou quase todos os dias' },
];

const AUDIT_CONSEQUENCE: AssessmentOption[] = [
  { value: 0, label: 'Não' },
  { value: 2, label: 'Sim, mas não no último ano' },
  { value: 4, label: 'Sim, no último ano' },
];

/** PHQ-9 — Patient Health Questionnaire-9 (Kroenke, Spitzer & Williams, 2001). */
const PHQ9_QUESTIONS: AssessmentQuestion[] = [
  'Pouco interesse ou prazer em fazer as coisas',
  'Se sentir para baixo, deprimido(a) ou sem esperança',
  'Dificuldade para pegar no sono ou permanecer dormindo, ou dormir demais',
  'Sentir-se cansado(a) ou com pouca energia',
  'Falta de apetite ou comer demais',
  'Sentir-se mal consigo mesmo(a) — ou que é um fracasso ou que decepcionou sua família ou você mesmo(a)',
  'Dificuldade de concentração nas coisas, como ler o jornal ou ver televisão',
  'Lentidão para se movimentar ou falar, a ponto de outras pessoas notarem — ou o oposto, estar tão agitado(a) que se movimenta muito mais que o normal',
  'Pensamento de que seria melhor estar morto(a) ou de se machucar de alguma forma',
].map((text) => ({ text, options: FREQUENCY_2_WEEKS }));

/** GAD-7 — Generalized Anxiety Disorder-7 (Spitzer, Kroenke, Williams & Löwe, 2006). */
const GAD7_QUESTIONS: AssessmentQuestion[] = [
  'Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)',
  'Não ser capaz de impedir ou controlar as preocupações',
  'Preocupar-se muito com diversas coisas',
  'Dificuldade para relaxar',
  'Ficar tão agitado(a) que se torna difícil permanecer sentado(a)',
  'Ficar facilmente aborrecido(a) ou irritado(a)',
  'Sentir medo como se algo terrível fosse acontecer',
].map((text) => ({ text, options: FREQUENCY_2_WEEKS }));

/** EPDS — Edinburgh Postnatal Depression Scale (Cox, Holden & Sagovsky, 1987). */
const EPDS_QUESTIONS: AssessmentQuestion[] = [
  {
    text: 'Tenho sido capaz de rir e ver o lado engraçado das coisas',
    options: [
      { value: 0, label: 'Tanto quanto sempre fiz' },
      { value: 1, label: 'Não tanto quanto antes' },
      { value: 2, label: 'Bem menos do que antes' },
      { value: 3, label: 'Nunca' },
    ],
  },
  {
    text: 'Tenho olhado as coisas com prazer, tenho tido esperança em relação ao futuro',
    options: [
      { value: 0, label: 'Tanto quanto sempre fiz' },
      { value: 1, label: 'Um pouco menos do que costumava' },
      { value: 2, label: 'Bem menos do que costumava' },
      { value: 3, label: 'Quase nunca' },
    ],
  },
  {
    text: 'Eu me culpei sem necessidade quando as coisas davam errado',
    options: [
      { value: 3, label: 'Sim, na maioria das vezes' },
      { value: 2, label: 'Sim, algumas vezes' },
      { value: 1, label: 'Raramente' },
      { value: 0, label: 'Não, nunca' },
    ],
  },
  {
    text: 'Fiquei ansiosa ou preocupada sem motivo',
    options: [
      { value: 0, label: 'Não, de jeito nenhum' },
      { value: 1, label: 'Raramente' },
      { value: 2, label: 'Sim, algumas vezes' },
      { value: 3, label: 'Sim, muitas vezes' },
    ],
  },
  {
    text: 'Senti-me assustada ou em pânico sem um bom motivo',
    options: [
      { value: 3, label: 'Sim, muitas vezes' },
      { value: 2, label: 'Sim, algumas vezes' },
      { value: 1, label: 'Não, raramente' },
      { value: 0, label: 'Não, de jeito nenhum' },
    ],
  },
  {
    text: 'Muitas coisas têm me sobrecarregado',
    options: [
      { value: 3, label: 'Sim, na maior parte do tempo não consegui lidar bem' },
      { value: 2, label: 'Sim, algumas vezes não consegui lidar tão bem quanto antes' },
      { value: 1, label: 'Não, na maior parte do tempo lidei bem' },
      { value: 0, label: 'Não, lidei tão bem quanto sempre' },
    ],
  },
  {
    text: 'Tenho me sentido tão infeliz que tenho tido dificuldade para dormir',
    options: [
      { value: 3, label: 'Sim, na maioria das vezes' },
      { value: 2, label: 'Sim, algumas vezes' },
      { value: 1, label: 'Raramente' },
      { value: 0, label: 'Não, nunca' },
    ],
  },
  {
    text: 'Tenho me sentido triste ou arrasada',
    options: [
      { value: 3, label: 'Sim, quase sempre' },
      { value: 2, label: 'Sim, muitas vezes' },
      { value: 1, label: 'Raramente' },
      { value: 0, label: 'Não, nunca' },
    ],
  },
  {
    text: 'Tenho me sentido tão infeliz que tenho chorado',
    options: [
      { value: 3, label: 'Sim, quase sempre' },
      { value: 2, label: 'Sim, muitas vezes' },
      { value: 1, label: 'Só ocasionalmente' },
      { value: 0, label: 'Não, nunca' },
    ],
  },
  {
    text: 'Ideias de fazer mal a mim mesma têm me ocorrido',
    options: [
      { value: 3, label: 'Sim, muitas vezes' },
      { value: 2, label: 'Algumas vezes' },
      { value: 1, label: 'Raramente' },
      { value: 0, label: 'Nunca' },
    ],
  },
];

/** SRQ-20 — Self-Reporting Questionnaire (OMS), validado no Brasil para rastreio de transtornos mentais comuns. */
const SRQ20_QUESTIONS: AssessmentQuestion[] = [
  'Tem dores de cabeça frequentes?',
  'Tem falta de apetite?',
  'Dorme mal?',
  'Assusta-se com facilidade?',
  'Tem tremores nas mãos?',
  'Sente-se nervoso(a), tenso(a) ou preocupado(a)?',
  'Tem má digestão?',
  'Tem dificuldade de pensar com clareza?',
  'Tem se sentido triste ultimamente?',
  'Tem chorado mais do que de costume?',
  'Encontra dificuldade para realizar com satisfação suas atividades diárias?',
  'Tem dificuldade para tomar decisões?',
  'Tem dificuldade no trabalho (o trabalho é penoso, causa sofrimento)?',
  'É incapaz de desempenhar um papel útil em sua vida?',
  'Tem perdido o interesse pelas coisas?',
  'Você se sente uma pessoa inútil, sem préstimo?',
  'Sente-se cansado(a) o tempo todo?',
  'Tem sensações desagradáveis no estômago?',
  'Você se cansa com facilidade?',
  'Tem tido a ideia de acabar com a sua vida?',
].map((text) => ({ text, options: YES_NO }));
// Os 20 itens oficiais do SRQ-20, reordenados aqui para colocar o item de
// ideação suicida por último (índice 19) — a soma não muda com a ordem, e
// isso casa com CLINICAL_ALERT_ITEM_INDEX.SRQ20 no backend (assessment-scoring.ts).

/** AUDIT — Alcohol Use Disorders Identification Test (OMS). */
const AUDIT_QUESTIONS: AssessmentQuestion[] = [
  {
    text: 'Com que frequência você consome bebidas alcoólicas?',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Mensalmente ou menos' },
      { value: 2, label: '2 a 4 vezes por mês' },
      { value: 3, label: '2 a 3 vezes por semana' },
      { value: 4, label: '4 ou mais vezes por semana' },
    ],
  },
  {
    text: 'Quantas doses de bebida alcoólica você consome tipicamente quando está bebendo?',
    options: [
      { value: 0, label: '1 ou 2' },
      { value: 1, label: '3 ou 4' },
      { value: 2, label: '5 ou 6' },
      { value: 3, label: '7 a 9' },
      { value: 4, label: '10 ou mais' },
    ],
  },
  { text: 'Com que frequência você consome seis ou mais doses em uma única ocasião?', options: AUDIT_FREQUENCY },
  {
    text: 'No último ano, com que frequência você percebeu que não conseguia parar de beber uma vez que tinha começado?',
    options: AUDIT_FREQUENCY,
  },
  {
    text: 'No último ano, com que frequência você não conseguiu fazer o que era esperado de você por causa da bebida?',
    options: AUDIT_FREQUENCY,
  },
  {
    text: 'No último ano, com que frequência você precisou beber pela manhã para se sentir bem ao longo do dia, depois de ter bebido muito no dia anterior?',
    options: AUDIT_FREQUENCY,
  },
  {
    text: 'No último ano, com que frequência você teve um sentimento de culpa ou remorso depois de beber?',
    options: AUDIT_FREQUENCY,
  },
  {
    text: 'No último ano, com que frequência você foi incapaz de lembrar o que aconteceu devido à bebida?',
    options: AUDIT_FREQUENCY,
  },
  {
    text: 'Você já causou ferimentos ou prejuízos a você mesmo(a) ou a outra pessoa por ter bebido?',
    options: AUDIT_CONSEQUENCE,
  },
  {
    text: 'Algum parente, amigo, médico ou outro profissional de saúde já se preocupou com o fato de você beber, ou sugeriu que você parasse?',
    options: AUDIT_CONSEQUENCE,
  },
];

/** PSS-10 — Perceived Stress Scale (Cohen, Kamarck & Mermelstein, 1983). Itens 4, 5, 7 e 8 têm pontuação invertida (calculada no servidor). */
const PSS10_QUESTIONS: AssessmentQuestion[] = [
  'Com que frequência você ficou chateado(a) por causa de algo que aconteceu inesperadamente?',
  'Com que frequência você se sentiu incapaz de controlar as coisas importantes da sua vida?',
  'Com que frequência você se sentiu nervoso(a) ou estressado(a)?',
  'Com que frequência você se sentiu confiante na sua capacidade de resolver problemas pessoais?',
  'Com que frequência você sentiu que as coisas estavam acontecendo do seu jeito?',
  'Com que frequência você achou que não conseguiria lidar com todas as coisas que tinha que fazer?',
  'Com que frequência você foi capaz de controlar as irritações da sua vida?',
  'Com que frequência você sentiu que estava por cima da situação (no controle)?',
  'Com que frequência você ficou irritado(a) por coisas que aconteceram fora do seu controle?',
  'Com que frequência você sentiu que as dificuldades se acumulavam tanto que você não conseguiria superá-las?',
].map((text) => ({ text, options: FREQUENCY_MONTH }));

/** WHO-5 — Índice de Bem-Estar da OMS. Nota alta = melhor bem-estar (o oposto das demais escalas). */
const WHO5_QUESTIONS: AssessmentQuestion[] = [
  'Tenho me sentido alegre e de bom humor',
  'Tenho me sentido calmo(a) e relaxado(a)',
  'Tenho me sentido ativo(a) e com energia',
  'Acordo me sentindo revigorado(a) e descansado(a)',
  'Meu dia a dia tem sido cheio de coisas que me interessam',
].map((text) => ({ text, options: TIME_2_WEEKS }));

export const ASSESSMENT_QUESTIONS: Record<AssessmentType, AssessmentQuestion[]> = {
  PHQ9: PHQ9_QUESTIONS,
  GAD7: GAD7_QUESTIONS,
  EPDS: EPDS_QUESTIONS,
  SRQ20: SRQ20_QUESTIONS,
  AUDIT: AUDIT_QUESTIONS,
  PSS10: PSS10_QUESTIONS,
  WHO5: WHO5_QUESTIONS,
};
