import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'min-w-0 rounded-2xl border border-ink-200 bg-white p-4 text-ink-900 shadow-card transition-all duration-200 dark:border-ink-dark-border dark:bg-ink-dark-surface dark:text-ink-dark-text dark:shadow-dark-card sm:p-5',
      className
    )}
    {...props}
  />
);

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-3 flex flex-col gap-1', className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('text-base font-semibold tracking-tight text-ink-900 dark:text-ink-dark-text', className)}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn('text-sm leading-6 text-ink-500 dark:text-ink-dark-muted', className)}
    {...props}
  />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('min-w-0 space-y-3', className)} {...props} />
);
