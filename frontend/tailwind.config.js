/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* === Soft Sky Blue Identity Tokens (Jabar Pintar Digital) === */
        primary: '#0284c7', /* Soft Sky Blue 600 */
        'on-primary': '#ffffff',
        'primary-container': '#e0f2fe', /* Sky 100 */
        'on-primary-container': '#0369a1', /* Sky 700 */
        'inverse-primary': '#7dd3fc', /* Sky 300 */

        secondary: '#475569', /* Slate 600 */
        'on-secondary': '#ffffff',
        'secondary-container': '#f1f5f9', /* Slate 100 */

        tertiary: '#0284c7',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#bae6fd',

        error: '#dc2626',
        'on-error': '#ffffff',
        'error-container': '#fef2f2',

        /* Clean Soft Sky Civic Utility Surfaces (Neutral Cool-Gray with Subtle Sky Hint, No Lavender Bias) */
        surface: '#f8fafc',
        'surface-dim': '#e2e8f0',
        'surface-bright': '#ffffff',
        'surface-tint': '#0284c7',
        'surface-variant': '#f1f5f9',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f8fafc',
        'surface-container': '#f1f5f9',
        'surface-container-high': '#e2e8f0',
        'surface-container-highest': '#cbd5e1',

        'on-surface': '#0f172a',
        'on-surface-variant': '#475569',

        'inverse-surface': '#1e293b',
        'inverse-on-surface': '#f8fafc',

        outline: '#94a3b8',
        'outline-variant': '#e2e8f0',

        background: '#f8fafc',
        'on-background': '#0f172a',

        /* Semantic Status Tokens (Always paired with text / icons) */
        'status-success': '#059669',
        'status-success-bg': '#ecfdf5',
        'status-warning': '#d97706',
        'status-warning-bg': '#fffbeb',
        'status-danger': '#dc2626',
        'status-danger-bg': '#fef2f2',
        'status-info': '#0284c7',
        'status-info-bg': '#f0f9ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.125rem',   /* 2px */
        DEFAULT: '0.25rem', /* 4px */
        md: '0.375rem',    /* 6px */
        lg: '0.5rem',      /* 8px — max per Civic Trust policy */
        xl: '0.75rem',     /* 12px */
        full: '9999px',
      },
      spacing: {
        base: '8px',
        xs: '4px',
        sm: '12px',
        md: '24px',
        lg: '48px',
        xl: '80px',
        gutter: '24px',
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        'max-width': '1280px',
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '0.01em' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '600' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'elevated': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
