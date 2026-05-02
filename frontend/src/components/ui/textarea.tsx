import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 shadow-soft outline-none transition duration-200 placeholder:text-ink-500 hover:border-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-ink-dark-border dark:bg-ink-dark-surface/92 dark:text-ink-100 dark:placeholder:text-ink-dark-muted dark:hover:border-ink-300 dark:focus:border-brand-300 dark:focus:ring-brand-400/15',
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';
