import React from 'react';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <div className="space-y-1.5">
          <h1 className="text-balance text-2xl font-semibold sm:text-3xl">{title}</h1>
          {description ? <div className="page-copy">{description}</div> : null}
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
};
