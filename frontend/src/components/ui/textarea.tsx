import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        // Base
        'w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none transition',

        // Light mode
        'border-ink-200 bg-white text-ink-900 placeholder:text-ink-400',
        'hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200',

        // Dark mode
        'dark:border-ink-800 dark:bg-ink-900 dark:text-ink-100 dark:placeholder:text-ink-500',
        'dark:hover:border-ink-700 dark:focus:border-brand-500 dark:focus:ring-brand-500/20',

        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-70',
        'disabled:bg-ink-50 disabled:text-ink-400',
        'dark:disabled:bg-ink-800 dark:disabled:text-ink-500',

        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';
