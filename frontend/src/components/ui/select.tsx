import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        `
        w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none transition

        bg-white text-ink-900 border-ink-200
        hover:border-ink-300
        focus:border-brand-500 focus:ring-2 focus:ring-brand-200

        disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400

        dark:bg-ink-800 dark:text-ink-100 dark:border-ink-700
        dark:hover:border-ink-600
        dark:focus:border-brand-400 dark:focus:ring-brand-400/30
        dark:disabled:bg-ink-900 dark:disabled:text-ink-500
        `,
        className
      )}
      {...props}
    />
  )
);

Select.displayName = 'Select';
