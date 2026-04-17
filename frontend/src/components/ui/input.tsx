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
        // Base
        'w-full rounded-xl border px-3 py-2 text-sm outline-none transition',

        // Light mode
        'border-ink-200 bg-white text-ink-900 placeholder:text-ink-400',
        'hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200',

        // Dark mode
        'dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:placeholder:text-ink-500',
        'dark:hover:border-ink-600 dark:focus:border-brand-500 dark:focus:ring-brand-500/20',

        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-70',
        'disabled:bg-ink-50 disabled:text-ink-400',
        'dark:disabled:bg-ink-800 dark:disabled:text-ink-500',

        // =========================
        // File input enhancements
        // =========================
        type === 'file' && [
          'cursor-pointer p-2',

          // remove ugly default styles
          'file:mr-4 file:rounded-lg file:border-0',
          'file:px-4 file:py-2 file:text-sm file:font-semibold',

          // light file button
          'file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100',

          // dark file button
          'dark:file:bg-brand-500/10 dark:file:text-brand-400 dark:hover:file:bg-brand-500/20',

          // filename text
          'text-ink-600 dark:text-ink-300',
        ],

        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
