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
        'min-h-11 w-full rounded-2xl border border-ink-300 bg-white/96 px-4 text-sm text-ink-900 shadow-soft outline-none transition duration-200 placeholder:text-ink-500 hover:border-ink-400 hover:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/12 dark:bg-[#0b1729]/88 dark:text-ink-50 dark:placeholder:text-[#8ca0bd] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_26px_-18px_rgba(2,8,23,0.75)] dark:hover:border-white/18 dark:hover:bg-[#0f1d33]/92 dark:focus:border-brand-300 dark:focus:bg-[#10213a]/96 dark:focus:ring-brand-400/15',
        type === 'file' && [
          'cursor-pointer p-2.5 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-800 hover:file:bg-brand-200 dark:file:bg-brand-500/18 dark:file:text-white dark:hover:file:bg-brand-500/28',
        ],
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
