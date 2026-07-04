import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-ink-200/80 bg-white/90 px-3.5 py-3 text-sm text-ink-900 outline-none shadow-soft transition duration-150 placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.045] dark:text-ink-dark-text dark:placeholder:text-ink-dark-muted dark:hover:border-brand-600/40 dark:focus:border-brand-500 dark:focus:ring-brand-500/20',
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';
