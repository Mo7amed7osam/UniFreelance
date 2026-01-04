import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getInterviewById, reviewInterview } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const ReviewInterview: React.FC = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [score, setScore] = useState<number>(0);
    const [status, setStatus] = useState<string>('pass');

    const { data: interview, isLoading, isError } = useQuery({
        queryKey: ['admin', 'interview', interviewId],
        queryFn: () => getInterviewById(interviewId as string),
        enabled: !!interviewId,
    });

    useEffect(() => {
        if (interview) {
            setScore(interview.score ?? 0);
            const nextStatus =
                interview.reviewStatus === 'pass' || interview.reviewStatus === 'fail'
                    ? interview.reviewStatus
                    : 'pass';
            setStatus(nextStatus);
        }
    }, [interview]);

    const reviewMutation = useMutation({
        mutationFn: () => reviewInterview(interviewId as string, { score, status }),
        onSuccess: () => {
            toast.success('Interview reviewed successfully.');
            navigate('/admin/dashboard');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to submit review.');
        },
    });

    const toAbsoluteUrl = (path?: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
        const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
        return `${origin}${path}`;
    };

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (isError || !interview) {
        return (
            <Card>
                <CardContent>
                    <p className="text-sm text-ink-500">Interview not found.</p>
                    <Button type="button" variant="ghost" onClick={() => navigate('/admin/dashboard')}>
                        Back to dashboard
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-wide text-ink-400">Admin review</p>
                    <h1 className="text-2xl font-semibold text-ink-900">
                        {interview.studentId?.name || 'Student'} · {interview.skillId?.name || 'Skill'}
                    </h1>
                </div>
                <Badge
                    variant={
                        interview.reviewStatus === 'pass'
                            ? 'success'
                            : interview.reviewStatus === 'fail'
                            ? 'danger'
                            : 'warning'
                    }
                >
                    {interview.reviewStatus || 'pending'}
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Interview responses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(interview.responses || []).map((response: any, index: number) => (
                        <div key={`${response.videoUrl}-${index}`} className="space-y-2">
                            <p className="text-sm font-semibold text-ink-700">
                                Question {index + 1}: {response.question}
                            </p>
                            <video className="aspect-video w-full rounded-2xl" controls src={toAbsoluteUrl(response.videoUrl)} />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Evaluation</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-ink-700">Score (0-100)</label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-ink-700">Decision</label>
                        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="pass">Approve (Pass)</option>
                            <option value="fail">Reject (Fail)</option>
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => reviewMutation.mutate()}
                            disabled={reviewMutation.isPending || !interview.isSubmitted}
                        >
                            {reviewMutation.isPending ? 'Submitting...' : 'Submit decision'}
                        </Button>
                        {!interview.isSubmitted ? (
                            <p className="text-xs text-ink-500">This interview has not been submitted yet.</p>
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReviewInterview;
