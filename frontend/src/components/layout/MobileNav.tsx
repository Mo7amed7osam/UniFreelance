import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';

import { navByRole } from './nav-config';

export const MobileNav = () => {
  const { user } = useAuth();
  const items = user ? navByRole[user.role] || [] : [];
  const mobileItems = user?.role === 'Student'
    ? items.filter((item) => ['Dashboard', 'Job Board', 'Skill Verification', 'Contracts', 'Wallet'].includes(item.label))
    : items.slice(0, 4);

  if (mobileItems.length === 0) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink-200/80 bg-white/[0.92] px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-18px_50px_-34px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-ink-dark-surface/[0.94] md:hidden"
      aria-label="Primary"
    >
      <div className={`grid gap-1 py-1.5 ${mobileItems.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const displayLabel = item.label === 'Skill Verification' ? 'Verify' : item.label;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-center text-[10px] font-semibold transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-400/[0.12] dark:text-brand-200 dark:ring-brand-400/20'
                    : 'text-ink-500 hover:text-ink-900 dark:text-ink-dark-muted dark:hover:text-ink-dark-text'
                )
              }
            >
              <Icon size={18} />
              <span className="line-clamp-1">{displayLabel}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
