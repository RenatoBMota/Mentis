import type { Config } from 'tailwindcss';
import { designTokens } from './lib/design-tokens';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base: designTokens.surface.base,
          raised: designTokens.surface.raised,
        },
        accent: {
          primary: designTokens.accent.primary,
          highlight: designTokens.accent.highlight,
        },
        status: {
          success: designTokens.status.success,
          warning: designTokens.status.warning,
          danger: designTokens.status.danger,
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      spacing: {
        grid: '8px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
