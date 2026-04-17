import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { setTheme, getTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
  const [theme, setCurrentTheme] = useState<'light' | 'dark'>(getTheme());

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setCurrentTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
};
