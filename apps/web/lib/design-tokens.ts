/**
 * Design tokens do PsiFlow — paleta nude/bege/verde-sálvia (substitui o
 * Dark Mode navy/ciano da PRD 9.1 original por decisão de produto).
 * Fonte única de verdade também consumida pelo tailwind.config.ts.
 */
export const designTokens = {
  ground: '#f4eee1',
  surface: {
    base: '#fbf7ef',
    raised: '#efe7d5',
  },
  border: '#e0d5bd',
  ink: {
    DEFAULT: '#34302a',
    muted: '#857b68',
    faint: '#a89d87',
  },
  accent: {
    primary: '#6f8a68',
    strong: '#566e51',
    soft: '#dde6d3',
    ink: '#f6f9f1',
  },
  status: {
    success: '#4c7a52',
    successSoft: '#dfead9',
    warning: '#a87a3a',
    warningSoft: '#f2e3cb',
    danger: '#b0583f',
    dangerSoft: '#f3ddd3',
  },
} as const;
