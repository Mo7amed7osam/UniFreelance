import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useAuth from '@/hooks/useAuth';
import {
  acceptContractWork,
  getContractDetails,
  requestContractChanges,
  submitContractReview,
  submitContractWork,
} from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const ContractDetails: React.FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isClient = user?.role === 'Client';
  const isStudent = user?.role === 'Student';

  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionLinks, setSubmissionLinks] = useState('');
  const [reviewRating, setReviewRating] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contracts', id],
    queryFn: () => getContractDetails(id as string),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: (payload: { message: string; links?: string[] }) =>
      submitContractWork(id as string, payload),
    onSuccess: () => {
      toast.success('Work submitted successfully.');
      setSubmissionMessage('');
      setSubmissionLinks('');
      queryClient.invalidateQueries({ queryKey: ['contracts', id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit work.');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptContractWork(id as string),
    onSuccess: () => {
      toast.success('Work accepted. Escrow released.');
      queryClient.invalidateQueries({ queryKey: ['contracts', id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to accept work.');
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: () => requestContractChanges(id as string),
    onSuccess: () => {
      toast.success('Changes requested.');
      queryClient.invalidateQueries({ queryKey: ['contracts', id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to request changes.');
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      submitContractReview(id as string, payload),
    onSuccess: () => {
      toast.success('Review submitted.');
      setHasReviewed(true);
      setReviewRating('');
      setReviewComment('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit review.');
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (isError || !data?.contract) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-rose-500">Failed to load contract.</p>
        </CardContent>
      </Card>
    );
  }

  const { contract, submissions } = data;

  const steps = [
    { label: 'HIRED', active: true },
    { label: 'SUBMITTED', active: ['submitted', 'completed'].includes(contract.status) },
    { label: 'ACCEPTED', active: contract.status === 'completed' },
    { label: 'PAID', active: contract.escrowStatus === 'released' },
    { label: 'REVIEWED', active: hasReviewed },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{contract.jobId?.title || 'Contract'}</CardTitle>
          <p className="text-sm text-ink-500">
            Client: {contract.clientId?.name || 'Client'} • Student: {contract.studentId?.name || 'Student'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="brand">{contract.status}</Badge>
            <Badge variant={contract.escrowStatus === 'released' ? 'success' : 'warning'}>
              {contract.escrowStatus}
            </Badge>
            <Badge variant="default">Budget: ${contract.agreedBudget}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-ink-500">
            {steps.map((step) => (
              <span
                key={step.label}
                className={`rounded-full px-3 py-1 ${
                  step.active ? 'bg-brand-50 text-brand-700' : 'bg-ink-50 text-ink-400'
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {(submissions || []).length ? (
            <div className="space-y-3">
              {(submissions || []).map((submission: any) => (
                <div key={submission._id} className="rounded-xl border border-ink-100 p-3">
                  <p className="text-sm text-ink-700">{submission.message}</p>
                  {(submission.links || []).length ? (
                    <div className="mt-2 text-xs text-brand-600">
                      {(submission.links || []).map((link: string, index: number) => (
                        <div key={`${link}-${index}`}>
                          <a href={link} target="_blank" rel="noreferrer">
                            {link}
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-2 text-xs text-ink-400">
                    {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">No submissions yet.</p>
          )}
        </CardContent>
      </Card>

      {isStudent ? (
        <Card>
          <CardHeader>
            <CardTitle>Deliver work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              rows={4}
              placeholder="Describe your delivery and notes."
              value={submissionMessage}
              onChange={(e) => setSubmissionMessage(e.target.value)}
              disabled={submitMutation.isPending}
            />
            <Textarea
              rows={3}
              placeholder="Links (one per line)"
              value={submissionLinks}
              onChange={(e) => setSubmissionLinks(e.target.value)}
              disabled={submitMutation.isPending}
            />
            <Button
              type="button"
              disabled={submitMutation.isPending || !submissionMessage.trim()}
              onClick={() =>
                submitMutation.mutate({
                  message: submissionMessage.trim(),
                  links: submissionLinks
                    .split('\n')
                    .map((link) => link.trim())
                    .filter(Boolean),
                })
              }
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit work'}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isClient ? (
        <Card>
          <CardHeader>
            <CardTitle>Client actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={acceptMutation.isPending || contract.status !== 'submitted'}
                onClick={() => acceptMutation.mutate()}
              >
                {acceptMutation.isPending ? 'Releasing...' : 'Accept work & release escrow'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={requestChangesMutation.isPending || contract.status !== 'submitted'}
                onClick={() => requestChangesMutation.mutate()}
              >
                {requestChangesMutation.isPending ? 'Updating...' : 'Request changes'}
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-ink-500">
                Reviews are available after escrow is released.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Rating (1-5)"
                  type="number"
                  min={1}
                  max={5}
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  disabled={reviewMutation.isPending || contract.escrowStatus !== 'released' || hasReviewed}
                />
              </div>
              <Textarea
                rows={3}
                placeholder="Share your feedback"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                disabled={reviewMutation.isPending || contract.escrowStatus !== 'released' || hasReviewed}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  reviewMutation.isPending ||
                  contract.escrowStatus !== 'released' ||
                  hasReviewed ||
                  !reviewRating.trim()
                }
                onClick={() =>
                  (() => {
                    const ratingValue = Number(reviewRating);
                    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
                      toast.error('Rating must be between 1 and 5.');
                      return;
                    }
                    reviewMutation.mutate({
                      rating: ratingValue,
                      comment: reviewComment.trim() || undefined,
                    });
                  })()
                }
              >
                {hasReviewed ? 'Review submitted' : reviewMutation.isPending ? 'Submitting...' : 'Submit review'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ContractDetails;
