import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition',
  {
    variants: {
      variant: {
        default:
          'border-ink-200 bg-ink-100 text-ink-700 dark:border-white/10 dark:bg-white/[0.08] dark:text-ink-200',
        subtle:
          'border-ink-200 bg-ink-100 text-ink-600 dark:border-white/10 dark:bg-white/[0.07] dark:text-ink-300',
        success:
          'border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-400/25 dark:bg-accent-400/10 dark:text-accent-200',
        warning:
          'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200',
        danger:
          'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-200',
        brand:
          'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-400/25 dark:bg-brand-400/10 dark:text-brand-200',
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
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
