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
      setStatus(
        interview.reviewStatus === 'pass' || interview.reviewStatus === 'fail'
          ? interview.reviewStatus
          : 'pass'
      );
    }
  }, [interview]);

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewInterview(interviewId as string, { score, status }),
    onSuccess: () => {
      toast.success('Interview reviewed successfully.');
      navigate('/admin/dashboard');
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
      <Card className="border-dashed dark:bg-ink-800 dark:border-ink-700">
        <CardContent className="py-10 text-center space-y-4">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Interview not found.
          </p>
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
            Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className="
        space-y-10 rounded-2xl p-6
        bg-gradient-to-br from-ink-50 via-white to-brand-100/30
        dark:bg-gradient-to-br dark:from-ink-900 dark:via-ink-900 dark:to-ink-800
      "
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
            Interview Review
          </p>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">
            {interview.studentId?.name} ·{' '}
            <span className="text-brand-600 dark:text-brand-400">
              {interview.skillId?.name}
            </span>
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

      {/* Responses */}
      <Card className="bg-white/80 backdrop-blur-sm dark:bg-ink-800 dark:border-ink-700">
        <CardHeader>
          <CardTitle className="text-lg text-ink-900 dark:text-white">
            Interview responses
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {(interview.responses || []).map((response: any, index: number) => (
            <div key={index} className="space-y-3">
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                Question {index + 1}: {response.question}
              </p>

              <video
                className="aspect-video w-full rounded-2xl border border-ink-200 dark:border-ink-700"
                controls
                src={toAbsoluteUrl(response.videoUrl)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Evaluation */}
      <Card className="bg-white/80 backdrop-blur-sm dark:bg-ink-800 dark:border-ink-700">
        <CardHeader>
          <CardTitle className="text-lg text-ink-900 dark:text-white">
            Evaluation
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
              Score (0-100)
            </label>

            <Input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
              Decision
            </label>

            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pass">Approve (Pass)</option>
              <option value="fail">Reject (Fail)</option>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Button
              onClick={() => reviewMutation.mutate()}
              disabled={reviewMutation.isPending || !interview.isSubmitted}
            >
              {reviewMutation.isPending
                ? 'Submitting...'
                : 'Submit decision'}
            </Button>

            {!interview.isSubmitted && (
              <p className="text-xs text-ink-500 dark:text-ink-400">
                This interview has not been submitted yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewInterview;