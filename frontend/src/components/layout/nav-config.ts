import {
  Briefcase,
  CalendarDays,
  ClipboardList,
  FileBadge,
  History,
  Home,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const navByRole: Record<string, NavItem[]> = {
  Student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Job Board', to: '/student/jobs', icon: Briefcase },
    { label: 'Contracts', to: '/student/contracts', icon: ClipboardList },
    { label: 'Wallet', to: '/student/wallet', icon: Wallet },
    { label: 'Skill Verification', to: '/student/skill-verification', icon: FileBadge },
    { label: 'Profile', to: '/student/profile', icon: Home },
    { label: 'Career Roadmap', to: '/student/career-roadmap', icon: Sparkles },
    { label: 'Interview History', to: '/student/interview-history', icon: History },
    { label: 'Events', to: '/events', icon: CalendarDays },
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
    { label: 'Payments', to: '/admin/payments', icon: ShieldCheck },
    { label: 'Events', to: '/admin/events', icon: CalendarDays },
  ],
};

/** How many nav items render inline in the top navigation before overflowing into "More". */
export const MAX_INLINE_NAV_ITEMS = 6;
