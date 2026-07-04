import * as React from 'react';

import { cn } from '@/lib/utils';

type LogoTone = 'auto' | 'inverted';

interface LogoProps {
  /** 'auto' adapts to light/dark theme; 'inverted' renders white for brand surfaces */
  tone?: LogoTone;
  /** Hide the wordmark and show only the mark */
  markOnly?: boolean;
  className?: string;
  markClassName?: string;
}

/**
 * Inline brand logo. Renders the mark as inline SVG and the wordmark as text so
 * it never depends on external asset loading or SVG <text> font support.
 */
export const Logo: React.FC<LogoProps> = ({
  tone = 'auto',
  markOnly = false,
  className,
  markClassName,
}) => {
  const inverted = tone === 'inverted';

  return (
    <span className={cn('inline-flex select-none items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
        className={cn('h-8 w-8 shrink-0', markClassName)}
      >
        <rect
          width="48"
          height="48"
          rx="12"
          className={inverted ? 'fill-white/15' : 'fill-brand-600'}
        />
        <path
          d="M12 36 C12 26 36 22 36 12"
          className="stroke-white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="36" cy="12" r="5" className={inverted ? 'fill-white' : 'fill-brand-300'} />
      </svg>
      {!markOnly ? (
        <span
          className={cn(
            'text-lg font-semibold tracking-tight',
            inverted ? 'text-white' : 'text-ink-900 dark:text-ink-dark-text'
          )}
        >
          shaghalny
        </span>
      ) : null}
    </span>
  );
};
