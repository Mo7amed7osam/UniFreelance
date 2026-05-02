import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { InterviewResultResponse } from '../types/interview.types';

interface InterviewResultProps {
  result: InterviewResultResponse;
}

const recommendationVariant = (value: string | null) => {
  if (value === 'pass') return 'success';
  if (value === 'fail') return 'danger';
  return 'warning';
};

export const InterviewResult: React.FC<InterviewResultProps> = ({ result }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>{result.skill} interview result</span>
            <Badge variant={recommendationVariant(result.recommendation)}>
              {result.recommendation || 'pending'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-ink-200 p-4 dark:border-ink-700">
            <p className="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">Status</p>
            <p className="mt-2 text-lg font-semibold text-ink-900 dark:text-white">{result.status}</p>
          </div>
          <div className="rounded-lg border border-ink-200 p-4 dark:border-ink-700">
            <p className="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">Final score</p>
            <p className="mt-2 text-lg font-semibold text-ink-900 dark:text-white">
              {result.finalScore ?? 'Pending manual review'}
            </p>
          </div>
          <div className="rounded-lg border border-ink-200 p-4 dark:border-ink-700">
            <p className="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">Admin review</p>
            <p className="mt-2 text-lg font-semibold text-ink-900 dark:text-white">{result.reviewStatus}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {result.answers.map((answer, index) => (
          <Card key={answer.answerId}>
            <CardHeader>
              <CardTitle className="text-base">
                Q{index + 1}. {answer.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={recommendationVariant(answer.recommendation)}>
                  {answer.recommendation}
                </Badge>
                <span className="text-sm text-ink-500 dark:text-ink-400">
                  Score: {answer.score ?? 'Pending manual review'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium text-ink-900 dark:text-white">Feedback</p>
                <p className="text-ink-600 dark:text-ink-300">{answer.feedback}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink-900 dark:text-white">Strengths</p>
                  <ul className="space-y-1 text-sm text-ink-600 dark:text-ink-300">
                    {(answer.strengths.length ? answer.strengths : ['None captured.']).map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink-900 dark:text-white">Weaknesses</p>
                  <ul className="space-y-1 text-sm text-ink-600 dark:text-ink-300">
                    {(answer.weaknesses.length ? answer.weaknesses : ['None captured.']).map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-ink-900 dark:text-white">Transcript</p>
                <p className="rounded-lg border border-dashed border-ink-200 p-3 text-sm text-ink-600 dark:border-ink-700 dark:text-ink-300">
                  {answer.transcript || 'Transcript unavailable. Manual review may still be required.'}
                </p>
              </div>

              {answer.processingError ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-rose-600">Processing note</p>
                  <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                    {answer.processingError}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
