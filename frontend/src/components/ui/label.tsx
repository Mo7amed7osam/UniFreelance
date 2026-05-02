import * as React from 'react';
import { cn } from '@/lib/utils';

export const Label = ({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn(
      'mb-1 block text-sm font-medium text-ink-700 transition-colors dark:text-ink-200',
      className
    )}
    {...props}
  />
);
