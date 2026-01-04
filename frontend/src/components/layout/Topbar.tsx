import { LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuth from '@/hooks/useAuth';

export const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-ink-100 bg-white px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-400">Welcome back</p>
        <h1 className="text-lg font-semibold text-ink-900">{user?.name || 'User'}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-ink-100 px-3 py-2 text-sm text-ink-500 md:flex">
          <Search size={16} />
          Search jobs, skills, candidates
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </header>
  );
};
