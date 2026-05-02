import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';

import logo from '@/assets/shaghalny-logo-premium.svg';
import useAuth from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const dashboardPathByRole = {
  Student: '/student/dashboard',
  Client: '/client/dashboard',
  Admin: '/admin/dashboard',
} as const;

const roleHighlights = [
  {
    title: 'Students & freelancers',
    description: 'Build a credible profile, verify skills, and turn coursework into paid opportunities.',
    icon: Users,
  },
  {
    title: 'Clients & job posters',
    description: 'Post roles, review proposals, and hire verified student talent with less screening overhead.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Admins & reviewers',
    description: 'Manage approvals, interview review, and payment verification from one clear control center.',
    icon: ShieldCheck,
  },
];

const productPillars = [
  {
    title: 'Built for student talent',
    description: 'A focused marketplace for early-career freelancers who need trust, structure, and visibility.',
    icon: Sparkles,
  },
  {
    title: 'AI verification with Gravis',
    description: 'Use structured AI interviews to validate skills before proposals move forward.',
    icon: Video,
  },
  {
    title: 'Clear hiring workflows',
    description: 'Jobs, proposals, contracts, and top-ups stay connected in one consistent workspace.',
    icon: CreditCard,
  },
];

const trustStats = [
  { label: 'Verified interviews', value: 'AI-backed' },
  { label: 'Hiring workflow', value: 'End-to-end' },
  { label: 'Audience', value: 'Students first' },
];

const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = user ? dashboardPathByRole[user.role as keyof typeof dashboardPathByRole] : null;

  return (
    <div className="page-shell">
      <header className="page-container pt-5">
        <div className="glass-panel flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 text-ink-900 no-underline dark:text-white">
            <img src={logo} alt="Shaghalny" className="h-11 w-11 rounded-2xl object-contain" />
            <div>
              <p className="text-lg font-semibold text-ink-900 dark:text-white">Shaghalny</p>
              <p className="text-xs uppercase tracking-[0.22em] text-ink-500 dark:text-ink-300">Student marketplace</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to={isAuthenticated && dashboardPath ? dashboardPath : '/register'}>
                {isAuthenticated ? 'Open dashboard' : 'Create account'}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="page-container pb-20 pt-8">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            <div className="space-y-4">
              <Badge variant="brand" className="w-fit">
                A freelancing marketplace built for students
              </Badge>
              <div className="space-y-4">
                <h1 className="text-balance text-5xl font-semibold sm:text-6xl">
                  Hire verified student talent without the usual trust gap.
                </h1>
                <p className="page-copy text-lg">
                  Shaghalny helps students prove their skills, helps clients screen faster, and keeps proposals,
                  contracts, and payments inside one professional marketplace.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="xl">
                <Link to={isAuthenticated && dashboardPath ? dashboardPath : '/register'}>
                  {isAuthenticated ? 'Go to workspace' : 'Join Shaghalny'}
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {trustStats.map((item) => (
                <div key={item.label} className="muted-panel rounded-2xl p-4">
                  <p className="text-sm font-semibold text-ink-900 dark:text-white">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-500 dark:text-ink-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <CardContent className="space-y-6 p-7">
              <div className="feature-highlight p-6 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/72">AI verification</p>
                    <p className="mt-2 text-2xl font-semibold text-white">Gravis interview layer</p>
                  </div>
                  <div className="rounded-2xl border border-white/18 bg-white/12 p-3">
                    <Video size={24} />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/84">
                  Students complete structured interviews before clients evaluate proposals, reducing noise and improving trust.
                </p>
              </div>

              <div className="grid gap-3">
                {productPillars.map((item) => (
                  <div key={item.title} className="muted-panel flex items-start gap-4 rounded-2xl p-4">
                    <div className="rounded-2xl bg-brand-100 p-3 text-brand-700 dark:bg-brand-400/12 dark:text-brand-100">
                      <item.icon size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-ink-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-ink-600 dark:text-ink-200">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          {roleHighlights.map((item) => (
            <Card key={item.title} className="interactive-card">
              <CardContent className="space-y-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-200">
                  <item.icon size={22} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">{item.title}</h2>
                  <p>{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-16">
          <Card className="overflow-hidden bg-gradient-to-r from-white/82 via-brand-50/80 to-accent-50/70 p-0 dark:bg-gradient-to-r dark:from-ink-dark-surface/80 dark:via-brand-400/10 dark:to-accent-400/10">
            <CardContent className="grid gap-8 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="space-y-4">
                <p className="page-eyebrow">How it works</p>
                <h2 className="text-4xl font-semibold">Professional workflow without the clutter.</h2>
                <p className="page-copy">
                  Shaghalny keeps the product simple: discover work, verify capability, shortlist credible talent,
                  then move into contracts and payments with fewer manual steps.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['1. Create a profile', 'Students build their profile and upload proof of work.'],
                  ['2. Verify skills', 'Gravis interviews help turn claims into measurable evidence.'],
                  ['3. Review proposals', 'Clients compare budgets, skills, and history in one place.'],
                  ['4. Hire confidently', 'Contracts and wallet flows carry the deal through delivery.'],
                ].map(([title, body]) => (
                  <div key={title} className="muted-panel rounded-2xl p-4">
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">{title}</p>
                    <p className="mt-2 text-sm text-ink-600 dark:text-ink-200">{body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16">
          <Card className="overflow-hidden bg-ink-950 p-0 text-white dark:bg-[#07101d]">
            <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <Badge variant="subtle" className="border-white/16 bg-white/16 text-white dark:border-white/16 dark:bg-white/16 dark:text-white">
                  Production-ready hiring experience
                </Badge>
                <h2 className="text-4xl font-semibold text-white">Start with the right workflow for your role.</h2>
                <p className="max-w-2xl text-base leading-7 text-white/84">
                  Whether you are a student proving capability or a client hiring verified talent, Shaghalny keeps the experience clear and dependable.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="soft" size="lg" className="border-white/10 bg-white/10 text-white hover:bg-white/15">
                  <Link to="/login">
                    <LayoutDashboard size={18} />
                    Sign in
                  </Link>
                </Button>
                <Button asChild size="lg">
                  <Link to="/register">
                    <BadgeCheck size={18} />
                    Create your account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 px-2 pt-12 text-sm text-ink-500 md:flex-row dark:text-ink-300">
          <p>© {new Date().getFullYear()} Shaghalny. Verified student talent, clearer hiring.</p>
          <div className="flex items-center gap-5">
            <Link to="/login">Sign in</Link>
            <Link to="/register">Register</Link>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
