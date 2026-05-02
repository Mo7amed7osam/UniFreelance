import React from 'react';

import type { InterviewQuestion as InterviewQuestionType } from '../types/interview.types';

interface InterviewQuestionProps {
  question: InterviewQuestionType;
}

export const InterviewQuestion: React.FC<InterviewQuestionProps> = ({ question }) => {
  return (
    <div className="space-y-3 rounded-lg border border-ink-200 bg-ink-50 p-4 dark:border-ink-700 dark:bg-ink-900/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
        Question {question.order}
      </p>
      <p className="text-base font-medium text-ink-900 dark:text-white">{question.text}</p>
      <p className="text-sm text-ink-500 dark:text-ink-400">
        Share your entire screen and record one clear answer. Audio from the recording is used for AI evaluation.
      </p>
    </div>
  );
};
