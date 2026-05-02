import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { toast } from 'sonner';

import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const highlights = [
  { icon: BadgeCheck, text: 'Verified student talent and trusted profiles' },
  { icon: Video, text: 'AI interview verification with Gravis' },
  { icon: ShieldCheck, text: 'Structured proposals, contracts, and payments' },
];

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const user = await login(values.email, values.password);
      toast.success('Welcome back!');
      if (user?.role === 'Admin') navigate('/admin/dashboard');
      else if (user?.role === 'Client') navigate('/client/dashboard');
      else navigate('/student/dashboard');
    } catch {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="page-container grid min-h-[calc(100vh-3rem)] gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="hidden overflow-hidden bg-ink-950 p-0 text-white lg:block">
          <CardContent className="flex h-full flex-col justify-between p-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                <Sparkles size={14} />
                Shaghalny
              </div>
              <div className="space-y-4">
                <h1 className="text-balance text-5xl font-semibold text-white">
                  Freelancing infrastructure built for students.
                </h1>
                <p className="max-w-xl text-base leading-7 text-white/84">
                  Sign in to manage proposals, verified interviews, contracts, and hiring workflows from one polished workspace.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {highlights.map((item) => (
                <div key={item.text} className="flex items-start gap-3 rounded-2xl border border-white/14 bg-white/12 p-4">
                  <div className="rounded-2xl bg-white/10 p-3 text-white">
                    <item.icon size={18} />
                  </div>
                  <p className="text-sm leading-6 text-white/86">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader className="space-y-3">
              <div className="page-eyebrow">Sign in</div>
              <div className="space-y-2">
                <CardTitle className="text-3xl">Welcome back to Shaghalny</CardTitle>
                <CardDescription>
                  Access your dashboard, proposals, interviews, and contracts without leaving the same workspace.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@shaghalny.com" {...register('email')} />
                  {errors.email ? <p className="text-sm text-rose-600 dark:text-rose-300">{errors.email.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" {...register('password')} />
                  {errors.password ? <p className="text-sm text-rose-600 dark:text-rose-300">{errors.password.message}</p> : null}
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                  {!isSubmitting ? <ArrowRight size={18} /> : null}
                </Button>
              </form>

              <div className="rounded-2xl border border-brand-200 bg-brand-50/90 p-4 dark:border-brand-400/18 dark:bg-brand-400/12">
                <p className="text-sm font-semibold text-ink-900 dark:text-white">New to the platform?</p>
                <p className="mt-1 text-sm text-ink-600 dark:text-ink-200">
                  Create an account as a student or client and start using the same verified marketplace workflow.
                </p>
              </div>

              <p className="text-center text-sm text-ink-500 dark:text-ink-300">
                Need an account?{' '}
                <Link className="font-semibold text-brand-600 dark:text-brand-200" to="/register">
                  Create one now
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
