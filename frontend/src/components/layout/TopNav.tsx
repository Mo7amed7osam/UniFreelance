import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, Menu, Moon, Search, Sun, User, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { Logo } from '@/components/brand/Logo';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { navByRole } from '@/components/layout/nav-config';
import { StudentPwaInstallButton } from '@/components/pwa/StudentPwaInstallButton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useAuth from '@/hooks/useAuth';
import { getTheme, setTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export const TopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setThemeState] = useState<'light' | 'dark'>(getTheme());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const items = user ? navByRole[user.role] || [] : [];

  const roleCopy = user?.role === 'Admin' ? 'Admin' : user?.role === 'Client' ? 'Client' : 'Student';

  const profilePath = useMemo(() => {
    if (user?.role === 'Student') return '/student/profile';
    if (user?.role === 'Client') return '/client/dashboard';
    return '/admin/dashboard';
  }, [user?.role]);

  const homePath = useMemo(() => {
    if (user?.role === 'Admin') return '/admin/dashboard';
    if (user?.role === 'Client') return '/client/dashboard';
    return '/student/dashboard';
  }, [user?.role]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    setTheme(next);
  };

  // Close the drawer on navigation and lock body scroll while it is open.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/72 shadow-[0_1px_0_rgba(15,23,42,0.035),0_18px_44px_-32px_rgba(15,23,42,0.42)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/72 dark:border-white/10 dark:bg-[#0d141f]/82 dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_18px_44px_-32px_rgba(0,0,0,0.9)] dark:supports-[backdrop-filter]:bg-[#0d141f]/82">
        <div className="mx-auto grid h-[3.75rem] w-full max-w-screen-2xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 xl:hidden dark:text-ink-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
            >
              <Menu size={18} />
            </button>

            <NavLink to={homePath} className="flex shrink-0 items-center rounded-xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Go to dashboard">
              <Logo className="gap-2 [&>span]:hidden min-[430px]:[&>span]:inline" markClassName="h-7 w-7" />
            </NavLink>
          </div>

          <nav className="hidden min-w-0 items-center justify-center gap-1 rounded-2xl border border-ink-200/60 bg-white/72 p-1 shadow-soft backdrop-blur-xl xl:flex dark:border-white/10 dark:bg-white/[0.055]" aria-label="Primary">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'relative isolate rounded-xl px-2.5 py-2 text-[13px] font-semibold leading-none no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 2xl:px-3',
                    isActive
                      ? 'text-ink-950 dark:text-white'
                      : 'text-ink-500 hover:text-ink-900 dark:text-ink-dark-muted dark:hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <motion.span
                        layoutId="topnav-active"
                        className="absolute inset-0 -z-10 rounded-xl border border-ink-200/80 bg-white shadow-[0_8px_20px_-14px_rgba(15,23,42,0.45),0_1px_0_rgba(255,255,255,0.9)_inset] dark:border-white/12 dark:bg-white/[0.14]"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    ) : (
                      <span className="absolute inset-0 -z-10 rounded-xl opacity-0 transition-opacity duration-150 hover:opacity-100 hover:bg-ink-100/70 dark:hover:bg-white/10" />
                    )}
                    <span className="whitespace-nowrap">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5">
            <label className="hidden h-10 items-center gap-2 rounded-2xl border border-ink-200/70 bg-white/70 px-3 text-sm shadow-soft backdrop-blur transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 2xl:flex dark:border-white/10 dark:bg-white/[0.045] dark:focus-within:border-brand-500 dark:focus-within:ring-brand-500/20">
              <Search size={13} className="shrink-0 text-ink-400 dark:text-ink-dark-muted" />
              <input
                type="search"
                placeholder="Search"
                aria-label="Search"
                className="w-36 bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-400 dark:text-ink-dark-text dark:placeholder:text-ink-dark-muted"
              />
            </label>

            {user?.role === 'Student' ? <StudentPwaInstallButton /> : null}
            {user?.role === 'Student' ? <NotificationBell /> : null}

            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-2xl border border-transparent p-1 pr-2 transition-colors hover:border-ink-200/70 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:border-white/10 dark:hover:bg-white/10"
                  aria-label="Open account menu"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px]">{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown size={12} className="hidden text-ink-400 sm:block dark:text-ink-dark-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-ink-900 dark:text-white">{user?.name}</p>
                    <Badge variant="brand">{roleCopy}</Badge>
                  </div>
                  <p className="truncate text-xs text-ink-500 dark:text-ink-400">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(profilePath)}>
                  <User size={14} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onClick={logout}>
                  <LogOut size={14} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.div
              key="drawer-backdrop"
              className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer-panel"
              className="fixed inset-y-0 left-0 z-50 flex w-[19rem] max-w-[85vw] flex-col border-r border-ink-200 bg-white shadow-elevated xl:hidden dark:border-ink-dark-border dark:bg-ink-dark-surface"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink-200 px-4 dark:border-ink-dark-border">
                <Logo markClassName="h-7 w-7" />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-ink-dark-muted dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Close navigation menu"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
                <div className="space-y-0.5">
                  {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * index, type: 'spring', stiffness: 320, damping: 28 }}
                      >
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors',
                              isActive
                                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                                : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-white/10 dark:hover:text-white'
                            )
                          }
                        >
                          <Icon size={16} className="shrink-0" />
                          {item.label}
                        </NavLink>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              <div className="shrink-0 border-t border-ink-200 p-3 dark:border-ink-dark-border">
                <div className="flex items-center gap-3 rounded-lg p-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{user?.name}</p>
                    <p className="truncate text-xs text-ink-500 dark:text-ink-400">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                    aria-label="Sign out"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
};
