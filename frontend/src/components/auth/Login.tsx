import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

  const onInvalid = (errors: Record<string, any>) => {
    console.warn('[LOGIN] validation failed', errors);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 px-6 py-12 text-white">
      
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Card className="border border-white/10 bg-white/90 backdrop-blur-xl text-ink-900 shadow-2xl rounded-2xl">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">
              Sign in to <span className="text-brand-600">UniFreelance</span>
            </CardTitle>
            <CardDescription className="text-ink-500">
              Access verified talent and opportunities in one place.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit, onInvalid)}
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@unifreelance.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-rose-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
              New here?{' '}
              <Link className="font-semibold text-brand-600" to="/register">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
  