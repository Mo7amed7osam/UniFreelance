import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-xl border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition',
  {
    variants: {
      variant: {
        default:
          'border-ink-200 bg-ink-100 text-ink-700',
        success:
          'border-emerald-200 bg-emerald-100 text-emerald-700',
        warning:
          'border-amber-200 bg-amber-100 text-amber-700',
        danger:
          'border-rose-200 bg-rose-100 text-rose-700',
        brand:
          'border-brand-200 bg-brand-100 text-brand-700',
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
