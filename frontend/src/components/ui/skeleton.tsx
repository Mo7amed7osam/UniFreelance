import * as React from 'react';
import { cn } from '@/lib/utils';

export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-xl bg-ink-100 dark:bg-white/[0.075]',
      'before:absolute before:inset-0 before:-translate-x-full',
      'before:animate-[shimmer_1.6s_infinite]',
      'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent dark:before:via-white/10',
      className
    )}
    {...props}
  />
);
