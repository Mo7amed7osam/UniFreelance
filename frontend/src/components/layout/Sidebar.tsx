import { NavLink } from 'react-router-dom';
import { Briefcase, ClipboardList, FileBadge, Home, LayoutDashboard, Users, Wallet } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const navByRole = {
  Student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Job Board', to: '/student/jobs', icon: Briefcase },
    { label: 'Contracts', to: '/student/contracts', icon: ClipboardList },
    { label: 'Wallet', to: '/student/wallet', icon: Wallet },
    { label: 'Skill Verification', to: '/student/skill-verification', icon: FileBadge },
    { label: 'Profile', to: '/student/profile', icon: Home },
  ],
  Client: [
    { label: 'Dashboard', to: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Post Job', to: '/client/post-job', icon: ClipboardList },
    { label: 'Proposals', to: '/client/view-proposals', icon: Users },
    { label: 'Contracts', to: '/client/contracts', icon: Briefcase },
    { label: 'Wallet', to: '/client/wallet', icon: Wallet },
  ],
  Admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Payments', to: '/admin/payments', icon: ClipboardList },
  ],
};

export const Sidebar = () => {
  const { user } = useAuth();
  const items = user ? navByRole[user.role] || [] : [];

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-ink-100 bg-white px-5 py-6 md:flex">
      <div className="flex items-center gap-2 text-lg font-semibold text-ink-900">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white">
          U
        </span>
        UniFreelance
      </div>
      <nav className="mt-10 space-y-1 text-sm">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-ink-600 transition hover:bg-ink-50 hover:text-ink-900',
                  isActive && 'bg-brand-50 text-brand-700'
                )
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
