import type { Config } from 'tailwindcss';
import { designTokens } from './lib/design-tokens';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: designTokens.ground,
        surface: {
          base: designTokens.surface.base,
          raised: designTokens.surface.raised,
        },
        border: designTokens.border,
        ink: {
          DEFAULT: designTokens.ink.DEFAULT,
          muted: designTokens.ink.muted,
          faint: designTokens.ink.faint,
        },
        accent: {
          primary: designTokens.accent.primary,
          strong: designTokens.accent.strong,
          soft: designTokens.accent.soft,
          ink: designTokens.accent.ink,
        },
        status: {
          success: designTokens.status.success,
          'success-soft': designTokens.status.successSoft,
          warning: designTokens.status.warning,
          'warning-soft': designTokens.status.warningSoft,
          danger: designTokens.status.danger,
          'danger-soft': designTokens.status.dangerSoft,
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
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-display)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
