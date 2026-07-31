/**
 * Design tokens do PsiFlow (PRD 9.1) — Dark Mode em azul-marinho/slate com
 * acento ciano. Fonte única de verdade também consumida pelo tailwind.config.ts.
 */
export const designTokens = {
  surface: {
    base: '#0d1b2a',
    raised: '#1b263b',
  },
  accent: {
    primary: '#1b4965',
    highlight: '#62b6cb',
  },
  status: {
    success: '#2e7d32',
    warning: '#b7791f',
    danger: '#b3261e',
  },
} as const;
