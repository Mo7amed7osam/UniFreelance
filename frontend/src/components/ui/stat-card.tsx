import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
  badge?: string;
  tone?: 'default' | 'brand';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  caption,
  badge,
  tone = 'default',
  className,
}) => {
  const brandTone =
    tone === 'brand'
      ? 'border-brand-300/60 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 text-white dark:border-brand-400/20'
      : '';

  return (
    <Card className={cn('kpi-card p-0', brandTone, className)}>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className={cn('text-sm font-semibold', tone === 'brand' ? 'text-white/78' : 'text-ink-500 dark:text-ink-300')}>
            {label}
          </p>
          {badge ? <Badge variant={tone === 'brand' ? 'subtle' : 'brand'}>{badge}</Badge> : null}
        </div>

        <div className={cn('text-4xl font-semibold tracking-tight', tone === 'brand' ? 'text-white' : 'text-ink-900 dark:text-white')}>
          {value}
        </div>

        {caption ? (
          <p className={cn('text-sm', tone === 'brand' ? 'text-white/78' : 'text-ink-500 dark:text-ink-300')}>
            {caption}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};
