import React from 'react';

interface InterviewProgressProps {
  answeredCount: number;
  totalQuestions: number;
}

export const InterviewProgress: React.FC<InterviewProgressProps> = ({
  answeredCount,
  totalQuestions,
}) => {
  const percentage = totalQuestions ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-ink-500 dark:text-ink-400">
        <span>
          Answered {answeredCount} / {totalQuestions}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className="h-2 rounded-full bg-brand-600 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
