import React from 'react';

import { cn } from '@/lib/utils';

import type { InterviewQuestion as InterviewQuestionType } from '../types/interview.types';

interface InterviewQuestionProps {
  question: InterviewQuestionType;
  variant?: 'panel' | 'overlay';
}

export const InterviewQuestion: React.FC<InterviewQuestionProps> = ({
  question,
  variant = 'panel',
}) => {
  const isOverlay = variant === 'overlay';

  return (
    <div
      className={cn(
        'space-y-2',
        isOverlay
          ? 'mx-auto max-w-2xl rounded-[1.5rem] bg-black/28 px-5 py-3 text-center backdrop-blur-sm'
          : 'rounded-lg border border-ink-200 bg-ink-50 p-4 dark:border-ink-700 dark:bg-ink-900/40'
      )}
    >
      <p
        className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.22em]',
          isOverlay ? 'text-white/72' : 'text-ink-600 dark:text-ink-300'
        )}
      >
        Question {question.order}
      </p>
      <p
        className={cn(
          'font-medium',
          isOverlay ? 'text-lg text-white md:text-xl' : 'text-base text-ink-900 dark:text-white'
        )}
      >
        {question.text}
      </p>
      <p
        className={cn(
          'text-sm',
          isOverlay ? 'text-white/82' : 'text-ink-600 dark:text-ink-300'
        )}
      >
        Listen, then answer clearly in 1-2 minutes.
      </p>
    </div>
  );
};
