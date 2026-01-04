import { NavLink } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { navByRole } from './Sidebar';

export const MobileNav = () => {
  const { user } = useAuth();
  const items = user ? navByRole[user.role] || [] : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-ink-100 bg-white px-2 py-2 shadow-soft md:hidden"
      aria-label="Primary"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex w-full flex-col items-center gap-1 rounded-xl px-2 py-1 text-center text-[11px] font-medium leading-tight text-ink-500 transition',
                isActive && 'bg-brand-50 text-brand-700'
              )
            }
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
