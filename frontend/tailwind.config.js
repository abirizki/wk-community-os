/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* === Soft Sky Blue Identity Tokens (Jabar Pintar Digital) === */
        primary: '#0284c7', /* Soft Sky Blue 600 */
        'primary-hover': '#0369a1', /* Sky 700 for hover states */
        'primary-active': '#075985', /* Sky 800 for active states */
        'primary-action': '#0369a1', /* Sky 700 High-Contrast Action / Link (5.93:1) */
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

        /* === EXTENDED 3D & ELEVATION TOKENS === */
        'elevation-1': '#ffffff',
        'elevation-2': '#fafcfe', /* Slight sky tint */
        'elevation-3': '#f5fafd',
        'elevation-4': '#eff8fd',

        /* === GLASS & FROSTED EFFECTS === */
        'glass-sky': 'rgba(224, 242, 254, 0.7)', /* Sky 100 with transparency */
        'glass-white': 'rgba(255, 255, 255, 0.85)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xs': '4px',    /* Badges, pills */
        'sm': '6px',    /* Small buttons, chips */
        DEFAULT: '8px', /* Input fields, default buttons */
        'md': '12px',   /* Cards (mobile) */
        'lg': '16px',   /* Cards (desktop), stat cards */
        'xl': '20px',   /* Headers, feature sections */
        '2xl': '24px',  /* Modal dialogs */
        '3xl': '28px',  /* Hero sections */
        'full': '9999px' /* Circular avatars */
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

        /* === COMPONENT-SPECIFIC SPACING === */
        'card-padding-sm': '16px',    /* Mobile cards */
        'card-padding-md': '20px',    /* Desktop cards */
        'card-padding-lg': '24px',    /* Feature cards */
        
        'header-padding-sm': '20px',  /* Mobile header */
        'header-padding-md': '32px',  /* Desktop header */
        
        'section-gap': '24px',        /* Between sections */
        'section-gap-lg': '32px',     /* Between major sections */
        
        'stat-padding': '20px',       /* Stat card internal */
        'stat-gap': '16px',           /* Gap between stats */
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
        /* Mobile-First 3D Shadow System */
        'xs': '0 1px 2px rgba(15, 23, 42, 0.04)',
        'sm': '0 2px 4px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.04)',
        DEFAULT: '0 4px 8px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.05)',
        'md': '0 8px 16px rgba(2, 132, 199, 0.08), 0 2px 6px rgba(15, 23, 42, 0.05)',
        'lg': '0 12px 24px rgba(2, 132, 199, 0.12), 0 4px 12px rgba(15, 23, 42, 0.06)',
        'xl': '0 20px 40px rgba(2, 132, 199, 0.15), 0 8px 16px rgba(15, 23, 42, 0.08)',
        '2xl': '0 24px 48px rgba(2, 132, 199, 0.18), 0 12px 24px rgba(15, 23, 42, 0.1)',
        
        /* 3D Inset Effects */
        'inset-top': 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'inset-bottom': 'inset 0 -1px 0 rgba(226, 232, 240, 0.4)',
        'inset-3d': 'inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(226, 232, 240, 0.4)',
        
        /* Button States */
        'button': '0 2px 8px rgba(2, 132, 199, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'button-hover': '0 4px 12px rgba(2, 132, 199, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        'button-active': '0 1px 4px rgba(2, 132, 199, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.15)',
        
        /* Card 3D */
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'card-3d': '0 4px 16px rgba(2, 132, 199, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'card-3d-hover': '0 8px 24px rgba(2, 132, 199, 0.12), 0 2px 6px rgba(15, 23, 42, 0.06)',
        'elevated': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        /* Gradient Presets */
        'gradient-sky-soft': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        'gradient-sky-card': 'linear-gradient(145deg, #ffffff 0%, #fafcfe 100%)',
        'gradient-sky-button': 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
        'gradient-sky-header': 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #bae6fd 100%)',
        'gradient-radial-sky': 'radial-gradient(circle at top right, #e0f2fe 0%, #ffffff 100%)',
      },
      animation: {
        'lift': 'lift 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        lift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(2, 132, 199, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(2, 132, 199, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
