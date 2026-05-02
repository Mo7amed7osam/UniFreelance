import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'card-surface surface-ring rounded-3xl p-6 text-ink-900 transition-all duration-200 dark:text-ink-50',
      className
    )}
    {...props}
  />
);

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'mb-5 flex flex-col gap-1.5',
      className
    )}
    {...props}
  />
);

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      'text-xl font-semibold tracking-tight text-ink-900 dark:text-white',
      className
    )}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      'text-sm leading-6 text-ink-600 dark:text-ink-200',
      className
    )}
    {...props}
  />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'space-y-4',
      className
    )}
    {...props}
  />
);
