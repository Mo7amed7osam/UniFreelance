import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, BriefcaseBusiness, GraduationCap, Shield } from 'lucide-react';
import { toast } from 'sonner';

import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Student', 'Client']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const roleCards = [
  {
    icon: GraduationCap,
    title: 'Students',
    body: 'Show verified skills, apply to roles, and manage contracts in one place.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Clients',
    body: 'Post jobs, review proposals, and shortlist verified student talent faster.',
  },
  {
    icon: Shield,
    title: 'Trusted workflow',
    body: 'Verification, contracts, and payment steps stay structured from the start.',
  },
];

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'Student' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const user = await registerUser(values);
      toast.success('Account created successfully');
      if (user?.role === 'Client') navigate('/client/dashboard');
      else navigate('/student/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="page-container grid min-h-[calc(100vh-3rem)] gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex items-center justify-center order-2 lg:order-1">
          <Card className="w-full max-w-xl">
            <CardHeader className="space-y-3">
              <div className="page-eyebrow">Create account</div>
              <div className="space-y-2">
                <CardTitle className="text-3xl">Join the Shaghalny marketplace</CardTitle>
                <CardDescription>
                  Create a student or client account. The workflow stays the same, but the dashboard adapts to your role.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Alex Johnson" {...register('name')} />
                  {errors.name ? <p className="text-sm text-rose-600 dark:text-rose-300">{errors.name.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="alex@shaghalny.com" {...register('email')} />
                  {errors.email ? <p className="text-sm text-rose-600 dark:text-rose-300">{errors.email.message}</p> : null}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Choose a password" {...register('password')} />
                    {errors.password ? <p className="text-sm text-rose-600 dark:text-rose-300">{errors.password.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select id="role" {...register('role')}>
                      <option value="Student">Student</option>
                      <option value="Client">Client</option>
                    </Select>
                  </div>
                </div>

                <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                  {!isSubmitting ? <ArrowRight size={18} /> : null}
                </Button>
              </form>

              <p className="text-center text-sm text-ink-500 dark:text-ink-300">
                Already have an account?{' '}
                <Link className="font-semibold text-brand-600 dark:text-brand-200" to="/login">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="order-1 overflow-hidden bg-gradient-to-br from-white/88 via-brand-50/80 to-accent-50/70 p-0 lg:order-2 dark:bg-gradient-to-br dark:from-ink-dark-surface/84 dark:via-brand-400/10 dark:to-accent-400/10">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-10">
            <div className="space-y-4">
              <p className="page-eyebrow">Why Shaghalny</p>
              <h1 className="text-balance text-5xl font-semibold">A cleaner path from student potential to paid work.</h1>
              <p className="page-copy">
                The platform is built to reduce uncertainty for both sides: students can prove capability, and clients can hire with clearer signals.
              </p>
            </div>

            <div className="grid gap-4">
              {roleCards.map((item) => (
                <div key={item.title} className="muted-panel flex items-start gap-4 rounded-2xl p-4">
                    <div className="rounded-2xl bg-brand-100 p-3 text-brand-700 dark:bg-brand-400/12 dark:text-brand-100">
                      <item.icon size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-ink-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-ink-600 dark:text-ink-200">{item.body}</p>
                    </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
