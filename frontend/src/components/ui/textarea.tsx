import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-ink-300 bg-white/96 px-4 py-3 text-sm text-ink-900 shadow-soft outline-none transition duration-200 placeholder:text-ink-500 hover:border-ink-400 hover:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/12 dark:bg-[#0b1729]/88 dark:text-ink-50 dark:placeholder:text-[#8ca0bd] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_26px_-18px_rgba(2,8,23,0.75)] dark:hover:border-white/18 dark:hover:bg-[#0f1d33]/92 dark:focus:border-brand-300 dark:focus:bg-[#10213a]/96 dark:focus:ring-brand-400/15',
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';
