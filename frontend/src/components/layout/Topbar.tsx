import { LogOut, Search, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuth from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export const Topbar = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <header className="relative flex items-center justify-between gap-4 border-b border-ink-100 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-ink-800 dark:bg-ink-900/80">
      
      <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand-500 via-brand-600 to-brand-700" />

      <div className="space-y-0.5">
        <p className="text-xs font-medium uppercase tracking-widest text-ink-400">
          Welcome back
        </p>
        <h1 className="text-lg font-semibold text-ink-900 dark:text-ink-100">
          {user?.name || 'User'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        
        <div className="group hidden items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm text-ink-600 shadow-sm transition-all hover:border-brand-400 focus-within:border-brand-500 focus-within:shadow-md md:flex dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">
          <Search
            size={16}
            className="text-ink-400 transition-colors group-focus-within:text-brand-600"
          />
          <input
            type="text"
            placeholder="Search jobs, skills, candidates"
            className="w-48 bg-transparent text-sm text-ink-700 placeholder-ink-400 outline-none transition-all focus:w-60 dark:text-ink-200 dark:placeholder-ink-500"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="flex items-center gap-2 border-ink-200 text-ink-700 transition-all hover:border-brand-500 hover:text-brand-600 hover:shadow-sm dark:border-ink-700 dark:text-ink-300"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </header>
  );
};
