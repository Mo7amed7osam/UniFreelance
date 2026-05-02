import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
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
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        ink: {
          50: '#f8fafc',
          100: '#edf2f7',
          200: '#d7e0ea',
          300: '#b5c1d2',
          400: '#73859c',
          500: '#57697e',
          600: '#44566c',
          700: '#314257',
          800: '#1f3145',
          900: '#0f1b2d',
          dark: {
            bg: '#08111f',
            surface: '#10203a',
            border: '#31435d',
            text: '#e6eef9',
            muted: '#9fb1c9',
          },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 16px 36px -22px rgba(15, 23, 42, 0.24), 0 8px 18px -12px rgba(15, 23, 42, 0.12)',
        card: '0 28px 70px -34px rgba(15, 23, 42, 0.32), 0 14px 30px -20px rgba(15, 23, 42, 0.18)',
        glass: '0 24px 72px -32px rgba(14, 116, 144, 0.24), 0 10px 24px -14px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config;
