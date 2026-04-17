import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // base
      'card-surface p-6 rounded-2xl transition-all duration-200',

      // light mode
      'bg-white text-ink-900 border border-ink-100',

      // dark mode 
      'dark:bg-ink-950 dark:text-ink-50 dark:border-ink-700',

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
      'mb-4 flex flex-col gap-1',
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
      'text-lg font-semibold tracking-tight dark:text-white',
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
      'text-sm leading-relaxed text-ink-500',
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
