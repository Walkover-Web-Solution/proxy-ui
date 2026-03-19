// ─────────────────────────────────────────────────────────────────────────────
// Tailwind CSS Configuration — Single Source of Truth
//
// Color tokens reference CSS custom properties emitted by the
// `emit-design-tokens` mixin in:
//   apps/36-blocks/src/assets/scss/theme/_custom-palette.scss
//
// To change any color, update ONLY _custom-palette.scss.
// Changes propagate automatically to:
//   1. Angular Material themes  (_default-theme.scss)
//   2. Shadow DOM themes        (apps/36-blocks-widget/src/shadow-dom-theme.scss)
//   3. Tailwind utilities       (this file, via CSS var() references)
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/**/*.{html,ts}',
    './libs/**/*.{html,ts}',
  ],

  darkMode: ['class', 'body.dark-theme'],

  theme: {
    extend: {
      colors: {
        // ── Primary palette tones (teal / #19E6CE origin) ──────────────────
        primary: {
          0:   'var(--proxy-primary-0)',
          10:  'var(--proxy-primary-10)',
          20:  'var(--proxy-primary-20)',
          30:  'var(--proxy-primary-30)',
          40:  'var(--proxy-primary-40)',
          50:  'var(--proxy-primary-50)',
          60:  'var(--proxy-primary-60)',
          70:  'var(--proxy-primary-70)',
          80:  'var(--proxy-primary-80)',
          90:  'var(--proxy-primary-90)',
          95:  'var(--proxy-primary-95)',
          100: 'var(--proxy-primary-100)',
          DEFAULT: 'var(--proxy-primary-80)',
        },

        // ── Secondary palette tones ─────────────────────────────────────────
        secondary: {
          40:  'var(--proxy-secondary-40)',
          80:  'var(--proxy-secondary-80)',
          90:  'var(--proxy-secondary-90)',
          DEFAULT: 'var(--proxy-secondary-40)',
        },

        // ── Tertiary palette tones ──────────────────────────────────────────
        tertiary: {
          40:  'var(--proxy-tertiary-40)',
          80:  'var(--proxy-tertiary-80)',
          90:  'var(--proxy-tertiary-90)',
          DEFAULT: 'var(--proxy-tertiary-40)',
        },

        // ── Neutral palette tones ───────────────────────────────────────────
        neutral: {
          10:  'var(--proxy-neutral-10)',
          20:  'var(--proxy-neutral-20)',
          30:  'var(--proxy-neutral-30)',
          40:  'var(--proxy-neutral-40)',
          50:  'var(--proxy-neutral-50)',
          60:  'var(--proxy-neutral-60)',
          70:  'var(--proxy-neutral-70)',
          80:  'var(--proxy-neutral-80)',
          90:  'var(--proxy-neutral-90)',
          95:  'var(--proxy-neutral-95)',
          100: 'var(--proxy-neutral-100)',
        },

        // ── Error palette tones ─────────────────────────────────────────────
        error: {
          40:  'var(--proxy-error-40)',
          80:  'var(--proxy-error-80)',
          90:  'var(--proxy-error-90)',
          DEFAULT: 'var(--proxy-error-40)',
        },

        // ── Semantic aliases (theme-aware via CSS vars) ─────────────────────
        accent:     'var(--proxy-color-accent)',
        'on-accent': 'var(--proxy-color-on-accent)',
        surface:    'var(--proxy-color-surface)',
        'on-surface': 'var(--proxy-color-on-surface)',
        outline:    'var(--proxy-color-outline)',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },

  plugins: [],
};
