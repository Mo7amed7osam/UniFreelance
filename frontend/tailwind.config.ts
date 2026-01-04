import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f7ff',
          100: '#e5efff',
          200: '#c2dcff',
          300: '#9ac6ff',
          400: '#5ea3ff',
          500: '#2f80ff',
          600: '#1f63e6',
          700: '#1c4fba',
          800: '#1d4493',
          900: '#1b3a78',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceff3',
          200: '#d5dae2',
          300: '#b4bcc9',
          400: '#8a95a5',
          500: '#6b7788',
          600: '#545f6f',
          700: '#434c5a',
          800: '#2f353f',
          900: '#1e232b',
        },
      },
      boxShadow: {
        'soft': '0 10px 30px -15px rgba(16, 24, 40, 0.35)',
        'card': '0 18px 45px -30px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
