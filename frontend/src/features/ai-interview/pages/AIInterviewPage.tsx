import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { CameraRecorder } from '../components/CameraRecorder';
import { InterviewProgress } from '../components/InterviewProgress';
import { InterviewQuestion } from '../components/InterviewQuestion';
import {
  getInterviewSession,
  submitInterviewAnswer,
  toAbsoluteMediaUrl,
} from '../services/interviewApi';

const AIInterviewPage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRecording, setSelectedRecording] = useState<{
    cameraFile: File;
    screenFile: File;
  } | null>(null);

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['ai-interview', sessionId],
    queryFn: () => getInterviewSession(sessionId as string),
    enabled: Boolean(sessionId),
  });

  const answerMutation = useMutation({
    mutationFn: async (questionId: string) => {
      if (!sessionId || !selectedRecording) {
        throw new Error('Video answer missing.');
      }
      return submitInterviewAnswer(sessionId, questionId, selectedRecording);
    },
    onSuccess: async (response) => {
      toast.success('Answer uploaded.');
      setSelectedRecording(null);
      await queryClient.invalidateQueries({ queryKey: ['ai-interview', sessionId] });
      if (response.completed) {
        navigate(`/student/ai-interview/${sessionId}/result`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to upload answer.');
    },
  });

  const nextQuestion = useMemo(() => {
    if (!session) return null;
    const answeredIds = new Set(session.answers.map((answer) => answer.questionId));
    return session.questions.find((question) => !answeredIds.has(question.id)) || null;
  }, [session]);

  const handleSubmitAnswer = async () => {
    if (!nextQuestion) return;
    if (!selectedRecording) {
      toast.error('Record video first.');
      return;
    }
    await answerMutation.mutateAsync(nextQuestion.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8">
          <p className="text-sm text-ink-500 dark:text-ink-400">Interview session not found.</p>
          <Button type="button" variant="ghost" onClick={() => navigate('/student/skill-verification')}>
            Back to skills
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (session.status === 'completed') {
    return (
      <Card>
        <CardContent className="space-y-4 py-8">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Interview already completed. Open result page.
          </p>
          <Button type="button" onClick={() => navigate(`/student/ai-interview/${session.sessionId}/result`)}>
            View result
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
            AI interview
          </p>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">
            {session.skill} skill verification
          </h1>
        </div>
        <Badge variant="brand">{session.status.replace('_', ' ')}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewProgress answeredCount={session.answers.length} totalQuestions={session.questions.length} />
        </CardContent>
      </Card>

      {nextQuestion ? <InterviewQuestion question={nextQuestion} /> : null}

      {nextQuestion ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <CameraRecorder
              disabled={answerMutation.isPending}
              questionKey={nextQuestion.id}
              onVideoReady={setSelectedRecording}
            />

            <Button
              type="button"
              className="w-full"
              onClick={handleSubmitAnswer}
              disabled={!selectedRecording || answerMutation.isPending}
            >
              {answerMutation.isPending ? 'Evaluating answer...' : 'Upload answer'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Answered questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.answers.length === 0 ? (
                <p className="text-sm text-ink-500 dark:text-ink-400">No answers uploaded yet.</p>
              ) : (
                session.answers.map((answer, index) => (
                  <div key={answer.answerId} className="space-y-3 rounded-lg border border-ink-200 p-3 dark:border-ink-700">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink-900 dark:text-white">
                        Q{index + 1}. {answer.question}
                      </p>
                      <Badge variant={answer.recommendation === 'pass' ? 'success' : answer.recommendation === 'fail' ? 'danger' : 'warning'}>
                        {answer.recommendation}
                      </Badge>
                    </div>
                    <video
                      className="aspect-video w-full rounded-lg"
                      controls
                      src={toAbsoluteMediaUrl(answer.cameraVideoUrl || answer.videoUrl)}
                    />
                    <p className="text-sm text-ink-500 dark:text-ink-400">{answer.feedback}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default AIInterviewPage;
