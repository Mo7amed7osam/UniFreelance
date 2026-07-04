import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          dark: {
            bg: '#0b0a14',
            surface: '#13111f',
            border: '#2a2547',
            text: '#ece9f8',
            muted: '#8b88b0',
          },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.06), 0 1px 0 rgba(255,255,255,0.85) inset',
        card: '0 16px 40px -26px rgba(15,23,42,0.42), 0 1px 0 rgba(255,255,255,0.82) inset',
        elevated: '0 24px 64px -28px rgba(15,23,42,0.42), 0 12px 28px -22px rgba(15,23,42,0.34)',
        glass: '0 24px 70px -34px rgba(37, 99, 235, 0.42), 0 1px 0 rgba(255,255,255,0.2) inset',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
