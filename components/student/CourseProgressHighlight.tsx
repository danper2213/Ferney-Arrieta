'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

type CourseProgressHighlightProps = {
  percent: number;
  completed: number;
  total: number;
  className?: string;
};

export function CourseProgressHighlight({
  percent,
  completed,
  total,
  className,
}: CourseProgressHighlightProps) {
  const hasLessons = total > 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary/80">
            <GraduationCap className="h-3.5 w-3.5" />
            Progreso del curso
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums leading-none text-primary sm:text-4xl">
              {hasLessons ? percent : 0}%
            </span>
            {hasLessons && percent === 100 && (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ¡Completado!
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold tabular-nums leading-tight">
            {completed}
            <span className="text-muted-foreground font-normal">/{total}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">lecciones</p>
        </div>
      </div>

      <Progress
        value={hasLessons ? percent : 0}
        className="mt-4 h-3 bg-primary/10 [&>[data-slot=progress-indicator]]:bg-primary"
      />

      {!hasLessons && (
        <p className="mt-2 text-xs text-muted-foreground">
          El contenido de este curso se publicará pronto.
        </p>
      )}
    </div>
  );
}
