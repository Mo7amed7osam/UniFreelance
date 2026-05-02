import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';

import { navByRole } from './Sidebar';

export const MobileNav = () => {
  const { user } = useAuth();
  const items = user ? navByRole[user.role] || [] : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-3 left-3 right-3 z-30 rounded-[1.75rem] border border-white/70 bg-white/88 p-2 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-ink-dark-surface/88 md:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-3 gap-2">
        {items.slice(0, 6).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-center text-[11px] font-semibold leading-tight transition-all duration-200',
                  'text-ink-500 hover:bg-brand-50 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/8 dark:hover:text-white',
                  isActive && 'bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 text-white shadow-soft hover:text-white'
                )
              }
            >
              <Icon size={18} className="transition-transform group-hover:-translate-y-0.5" />
              <span className="line-clamp-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
