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
    budget: z.string().optional(),
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
            budget: '',
            duration: '',
        },
    });

    const selectedSkills = watch('requiredSkills');

    useEffect(() => {
        register('requiredSkills');
    }, [register]);

    const { mutateAsync: createJob } = useMutation({
        mutationFn: (payload: { title: string; description: string; requiredSkills: string[] }) => postJob(payload),
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
        const metaLines = [];
        if (values.budget) metaLines.push(`Budget: ${values.budget}`);
        if (values.duration) metaLines.push(`Duration: ${values.duration}`);
        const description = metaLines.length ? `${values.description}\n\n${metaLines.join('\n')}` : values.description;
        await createJob({
            title: values.title,
            description,
            requiredSkills: values.requiredSkills,
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm uppercase tracking-wide text-ink-400">Client workspace</p>
                <h1 className="text-2xl font-semibold text-ink-900">Post a new job</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Job details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-ink-700">Job title</label>
                            <Input placeholder="e.g. UI designer for mobile app" {...register('title')} />
                            {errors.title ? <p className="text-xs text-rose-500">{errors.title.message}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-ink-700">Description</label>
                            <Textarea rows={5} placeholder="Describe the project, scope, and goals..." {...register('description')} />
                            {errors.description ? (
                                <p className="text-xs text-rose-500">{errors.description.message}</p>
                            ) : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-ink-700">Budget (optional)</label>
                                <Input placeholder="e.g. $300 - $600" {...register('budget')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-ink-700">Duration (optional)</label>
                                <Input placeholder="e.g. 2 weeks" {...register('duration')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-ink-700">Required skills</label>
                            {isLoading ? (
                                <Skeleton className="h-20 w-full" />
                            ) : (skills || []).length === 0 ? (
                                <p className="text-sm text-ink-500">No skills available. Contact admin to add skills.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {(skills || []).map((skill: any) => (
                                        <button
                                            key={skill._id}
                                            type="button"
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                                selectedSkills.includes(skill._id)
                                                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                                                    : 'border-ink-200 text-ink-600'
                                            }`}
                                            onClick={() => toggleSkill(skill._id)}
                                        >
                                            {skill.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {errors.requiredSkills ? (
                                <p className="text-xs text-rose-500">{errors.requiredSkills.message}</p>
                            ) : null}
                            {selectedSkills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedSkills.map((skillId) => {
                                        const skill = (skills || []).find((item: any) => item._id === skillId);
                                        return (
                                            <Badge key={skillId} variant="brand">
                                                {skill?.name || skillId}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Posting...' : 'Publish job'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PostJob;
