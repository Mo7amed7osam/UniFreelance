import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
      if (user?.role === 'Client') {
        navigate('/client/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 px-6 py-12 text-white">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Card className="rounded-2xl border border-white/10 bg-white/90 text-ink-900 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              Create your{' '}
              <span className="text-brand-600">UniFreelance</span> account
            </CardTitle>
            <CardDescription className="text-ink-500">
              Showcase skills or hire verified student talent.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Alex Johnson"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@unifreelance.com"
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

              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select id="role" {...register('role')}>
                  <option value="Student">Student</option>
                  <option value="Client">Client</option>
                </Select>
              </div>

              <Button
                className="w-full"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Creating account...'
                  : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
              Already have an account?{' '}
              <Link
                className="font-semibold text-brand-600"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
