import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200',
      className
    )}
    {...props}
  />
));

Input.displayName = 'Input';
