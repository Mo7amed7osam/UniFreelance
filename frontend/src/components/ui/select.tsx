import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'min-h-11 w-full rounded-2xl border border-ink-300 bg-white/96 px-4 text-sm text-ink-900 shadow-soft outline-none transition duration-200 hover:border-ink-400 hover:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/12 dark:bg-[#0b1729]/88 dark:text-ink-50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_26px_-18px_rgba(2,8,23,0.75)] dark:hover:border-white/18 dark:hover:bg-[#0f1d33]/92 dark:focus:border-brand-300 dark:focus:bg-[#10213a]/96 dark:focus:ring-brand-400/15',
        className
      )}
      {...props}
    />
  )
);

Select.displayName = 'Select';
