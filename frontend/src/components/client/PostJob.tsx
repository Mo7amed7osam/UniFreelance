import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { getSkills, postJob } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(20, 'Description should be at least 20 characters.'),
  requiredSkills: z.array(z.string()).min(1, 'Select at least one skill.'),
  minBudget: z.string().optional(),
  maxBudget: z.string().optional(),
  duration: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PostJob: React.FC = () => {
  const navigate = useNavigate();

  const { data: skills, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: getSkills,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      requiredSkills: [],
      minBudget: '',
      maxBudget: '',
      duration: '',
    },
  });

  const selectedSkills = watch('requiredSkills');

  useEffect(() => {
    register('requiredSkills');
  }, [register]);

  const { mutateAsync: createJob } = useMutation({
    mutationFn: postJob,
    onSuccess: () => {
      toast.success('Job posted successfully.');
      navigate('/client/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to post job.');
    },
  });

  const toggleSkill = (skillId: string) => {
    const next = selectedSkills.includes(skillId)
      ? selectedSkills.filter((id) => id !== skillId)
      : [...selectedSkills, skillId];
    setValue('requiredSkills', next, { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    await createJob({
      title: values.title,
      description: values.description,
      requiredSkills: values.requiredSkills,
      budgetMin: values.minBudget ? Number(values.minBudget) : undefined,
      budgetMax: values.maxBudget ? Number(values.maxBudget) : undefined,
      duration: values.duration || undefined,
    });
  };

  return (
    <div
      className="
        space-y-10 rounded-2xl p-6
        bg-gradient-to-br from-ink-50 via-white to-brand-100/30
        dark:bg-gradient-to-br dark:from-ink-900 dark:via-ink-900 dark:to-ink-800
      "
    >
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-400">
          Client Workspace
        </p>
        <h1 className="text-3xl font-semibold text-ink-900 dark:text-white">
          Post a{' '}
          <span className="text-brand-600 dark:text-brand-400">
            new job
          </span>
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Share project details and start receiving proposals.
        </p>
      </div>

      {/* Form Card */}
      <Card
        className="
          bg-white/80 backdrop-blur-sm transition-all
          hover:shadow-xl
          dark:bg-ink-800 dark:border-ink-700
        "
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ink-900 dark:text-white">
            Job details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                Job title
              </label>
              <Input
                placeholder="e.g. UI designer for mobile app"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-rose-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                Description
              </label>
              <Textarea
                rows={5}
                placeholder="Describe the project, scope, and goals..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-rose-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Budget & Duration */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                  Min budget
                </label>
                <Input type="number" min={0} placeholder="e.g. 300" {...register('minBudget')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                  Max budget
                </label>
                <Input type="number" min={0} placeholder="e.g. 600" {...register('maxBudget')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                  Duration (optional)
                </label>
                <Input placeholder="e.g. 2 weeks" {...register('duration')} />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                Required skills
              </label>

              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (skills || []).length === 0 ? (
                <p className="text-sm text-ink-500 dark:text-ink-400">
                  No skills available. Contact admin to add skills.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(skills || []).map((skill: any) => {
                    const active = selectedSkills.includes(skill._id);
                    return (
                      <button
                        key={skill._id}
                        type="button"
                        onClick={() => toggleSkill(skill._id)}
                        className={`
                          rounded-full border px-3 py-1 text-xs font-semibold transition
                          ${
                            active
                              ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                              : 'border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-600 dark:text-ink-300 dark:hover:bg-ink-700'
                          }
                        `}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {errors.requiredSkills && (
                <p className="text-xs text-rose-500 dark:text-rose-500">
  Select at least one skill.
</p>

              )}

              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((id) => {
                    const skill = (skills || []).find((s: any) => s._id === id);
                    return (
                      <Badge key={id} variant="brand">
                        {skill?.name || id}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Posting…' : 'Publish job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
