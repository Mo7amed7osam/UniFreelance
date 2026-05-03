import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-soft backdrop-blur-sm transition',
  {
    variants: {
      variant: {
        default:
          'border-ink-300 bg-white/96 text-ink-800 shadow-soft dark:border-ink-dark-border dark:bg-[#12233d] dark:text-ink-100',
        subtle:
          'border-ink-200 bg-ink-100 text-ink-800 dark:border-brand-300/18 dark:bg-[#142742] dark:text-ink-50',
        success:
          'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/28 dark:bg-emerald-500/16 dark:text-emerald-50',
        warning:
          'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/28 dark:bg-amber-500/16 dark:text-amber-50',
        danger:
          'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/28 dark:bg-rose-500/16 dark:text-rose-50',
        brand:
          'border-brand-500/55 bg-gradient-to-r from-brand-700 via-brand-600 to-accent-600 text-white dark:border-brand-300/35 dark:from-brand-600 dark:via-brand-500 dark:to-accent-500 dark:text-white',
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
