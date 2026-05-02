import { LogOut, Moon, Search, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useAuth from '@/hooks/useAuth';
import { getTheme, setTheme } from '@/lib/theme';

const greetingLabel = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const Topbar = () => {
  const { user, logout } = useAuth();
  const [theme, setThemeState] = useState<'light' | 'dark'>(getTheme());

  const roleCopy = useMemo(() => {
    if (user?.role === 'Admin') return 'Admin workspace';
    if (user?.role === 'Client') return 'Client workspace';
    return 'Student workspace';
  }, [user?.role]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    setTheme(next);
  };

  return (
    <header className="page-container pt-4">
      <div className="glass-panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink-600 dark:text-ink-200">{greetingLabel()}</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{user?.name || 'Workspace'}</h1>
            {user?.role ? <Badge variant="brand">{roleCopy}</Badge> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-h-11 w-full items-center gap-3 rounded-2xl border border-ink-200 bg-white/95 px-4 text-sm text-ink-600 shadow-soft focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100 dark:border-ink-dark-border dark:bg-ink-dark-surface/88 dark:text-ink-200 dark:focus-within:ring-brand-400/15 sm:w-72">
            <Search size={16} className="text-ink-500 dark:text-ink-300" />
            <input
              type="text"
              placeholder="Search jobs, skills, candidates"
              className="w-full bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-500 dark:text-ink-100 dark:placeholder:text-ink-dark-muted"
            />
          </label>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            <Button variant="outline" onClick={logout}>
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
