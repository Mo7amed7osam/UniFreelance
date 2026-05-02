import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'min-h-11 w-full rounded-2xl border border-ink-300 bg-white px-4 text-sm text-ink-900 shadow-soft outline-none transition duration-200 placeholder:text-ink-500 hover:border-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-ink-dark-border dark:bg-ink-dark-surface/92 dark:text-ink-100 dark:placeholder:text-ink-dark-muted dark:hover:border-ink-300 dark:focus:border-brand-300 dark:focus:ring-brand-400/15',
        type === 'file' && [
          'cursor-pointer p-2.5 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-800 hover:file:bg-brand-200 dark:file:bg-brand-400/14 dark:file:text-brand-100 dark:hover:file:bg-brand-400/20',
        ],
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
