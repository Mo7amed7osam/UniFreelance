import * as React from 'react';
import { cn } from '@/lib/utils';

export const Table = ({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div
    className={cn(
      'w-full overflow-x-auto rounded-3xl border bg-white/96 shadow-card backdrop-blur-xl dark:border-[#334866] dark:bg-[#0f1d33]'
    )}
  >
    <table
      className={cn('min-w-full border-collapse text-sm', className)}
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
      'text-left text-xs uppercase tracking-[0.18em] text-ink-600 dark:text-ink-200',
      'bg-ink-100/90 dark:bg-[#142742]',
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
      'divide-y divide-ink-200 dark:divide-[#253854]',
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
      'transition-colors hover:bg-brand-50/80 dark:hover:bg-[#152a46]',
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
      'px-5 py-4 font-semibold text-ink-700 dark:text-ink-100',
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
      'px-5 py-4 align-top text-ink-800 dark:text-ink-100',
      className
    )}
    {...props}
  />
);
