import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { InterviewResult } from '../components/InterviewResult';
import { getInterviewResult } from '../services/interviewApi';

const AIInterviewResultPage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ai-interview-result', sessionId],
    queryFn: () => getInterviewResult(sessionId as string),
    enabled: Boolean(sessionId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8">
          <p className="text-sm text-ink-500 dark:text-ink-400">Unable to load interview result.</p>
          <Button type="button" variant="ghost" onClick={() => navigate('/student/skill-verification')}>
            Back to skills
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <InterviewResult result={data} />;
};

export default AIInterviewResultPage;
