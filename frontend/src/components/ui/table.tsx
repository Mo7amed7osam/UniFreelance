import * as React from 'react';
import { cn } from '@/lib/utils';

export const Table = ({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div
    className={cn(
      'w-full overflow-hidden rounded-2xl border',
      // light
      'border-ink-100 bg-white/80',
      // dark
      'dark:border-ink-700 dark:bg-ink-800/80'
    )}
  >
    <table
      className={cn('w-full border-collapse text-sm', className)}
      {...props}
    />
  </div>
);

export const TableHead = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead
    className={cn(
      // base
      'text-left text-xs uppercase tracking-wide',

      // light
      'bg-ink-50 text-ink-500',

      // dark
      'dark:bg-ink-900 dark:text-ink-400',

      className
    )}
    {...props}
  />
);

export const TableBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody
    className={cn(
      // light
      'divide-y divide-ink-100',

      // dark
      'dark:divide-ink-700',

      className
    )}
    {...props}
  />
);

export const TableRow = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      'transition-colors',

      // light hover
      'hover:bg-brand-50/40',

      // dark hover
      'dark:hover:bg-ink-900',

      className
    )}
    {...props}
  />
);

export const TableHeaderCell = ({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      'px-4 py-3 font-semibold',

      // light
      'text-ink-600',

      // dark
      'dark:text-ink-300',

      className
    )}
    {...props}
  />
);

export const TableCell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn(
      'px-4 py-3 align-top',

      // light
      'text-ink-700',

      // dark
      'dark:text-ink-200',

      className
    )}
    {...props}
  />
);
