import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition',
  {
    variants: {
      variant: {
        default:
          'border-ink-300 bg-white/96 text-ink-800 shadow-soft dark:border-ink-dark-border dark:bg-ink-dark-surface/92 dark:text-ink-100',
        subtle:
          'border-ink-200 bg-ink-100 text-ink-700 dark:border-white/10 dark:bg-white/10 dark:text-ink-100',
        success:
          'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/24 dark:bg-emerald-500/12 dark:text-emerald-100',
        warning:
          'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/24 dark:bg-amber-500/12 dark:text-amber-100',
        danger:
          'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/24 dark:bg-rose-500/12 dark:text-rose-100',
        brand:
          'border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-400/28 dark:bg-brand-400/14 dark:text-brand-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span
    className={cn(badgeVariants({ variant }), className)}
    {...props}
  />
);
