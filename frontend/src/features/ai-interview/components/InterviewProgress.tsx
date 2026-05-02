import React from 'react';

interface InterviewProgressProps {
  answeredCount: number;
  totalQuestions: number;
  variant?: 'default' | 'inverted';
}

export const InterviewProgress: React.FC<InterviewProgressProps> = ({
  answeredCount,
  totalQuestions,
  variant = 'default',
}) => {
  const percentage = totalQuestions ? (answeredCount / totalQuestions) * 100 : 0;
  const inverted = variant === 'inverted';

  return (
    <div className="space-y-2">
      <div
        className={[
          'flex items-center justify-between text-sm',
          inverted ? 'text-white/58' : 'text-ink-500 dark:text-ink-400',
        ].join(' ')}
      >
        <span>
          Answered {answeredCount} / {totalQuestions}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className={['h-2 w-full rounded-full', inverted ? 'bg-white/10' : 'bg-ink-100 dark:bg-ink-800'].join(' ')}>
        <div
          className={['h-2 rounded-full transition-all', inverted ? 'bg-white/80' : 'bg-brand-600'].join(' ')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
