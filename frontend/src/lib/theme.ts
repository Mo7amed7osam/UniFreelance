// src/lib/theme.ts
type Theme = 'light' | 'dark';

export const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return (localStorage.getItem('theme') as Theme) || 'light';
};

export const setTheme = (theme: Theme) => {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem('theme', theme);
};
