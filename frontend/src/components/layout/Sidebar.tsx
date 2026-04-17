import { NavLink } from 'react-router-dom';
import {
  Briefcase,
  ClipboardList,
  FileBadge,
  Home,
  LayoutDashboard,
  Users,
  Wallet,
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

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
<aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-ink-100 bg-white px-6 py-6 md:flex dark:border-ink-800 dark:bg-ink-900">
      
      {/* Logo (بالجريدينت الأصلي زي ما طلبت بالظبط) */}
      <div className="flex items-center gap-4">
        <img
          src={logo}
          alt="UniFreelance Logo"
          className="h-12 w-12 object-contain"
        />

        <span className="text-xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 bg-clip-text text-transparent">
            Uni
          </span>
          <span className="bg-gradient-to-r from-ink-700 to-ink-900 bg-clip-text text-transparent dark:from-ink-100 dark:to-ink-300">
            Freelance
          </span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="mt-12 space-y-1 text-sm">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 font-medium transition-all',
                  'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                  'dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white',
                  isActive &&
                    'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
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
