import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] dark:focus-visible:ring-offset-ink-dark-surface',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 text-white shadow-soft hover:-translate-y-0.5 hover:shadow-glass',
        primary:
          'bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 text-white shadow-soft hover:-translate-y-0.5 hover:shadow-glass',
        secondary:
          'bg-ink-900 text-white shadow-soft hover:-translate-y-0.5 hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100',
        soft:
          'border border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300 hover:bg-brand-100 dark:border-brand-400/20 dark:bg-brand-400/10 dark:text-brand-200 dark:hover:bg-brand-400/15',
        outline:
          'border border-ink-200 bg-white/75 text-ink-700 shadow-soft hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 dark:border-ink-dark-border dark:bg-ink-dark-surface/85 dark:text-ink-100 dark:hover:border-brand-400/30 dark:hover:bg-brand-400/10',
        ghost:
          'bg-transparent text-ink-700 hover:bg-white/70 hover:text-ink-900 dark:text-ink-200 dark:hover:bg-white/10 dark:hover:text-white',
        danger:
          'bg-rose-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-rose-700',
        success:
          'bg-emerald-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-emerald-700',
      },
      size: {
        sm: 'min-h-10 px-4 text-sm',
        md: 'min-h-11 px-5 text-sm',
        lg: 'min-h-12 px-6 text-base',
        xl: 'min-h-14 px-7 text-base',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        className: cn(classes, (children.props as { className?: string }).className),
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
