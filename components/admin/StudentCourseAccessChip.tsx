'use client';

import { isEnrollmentActive } from '@/lib/enrollment-access';
import { EnrollmentAccessHint } from '@/components/shared/EnrollmentAccessSummary';
import { cn } from '@/lib/utils';

type StudentCourseAccessChipProps = {
  courseTitle: string;
  expiresAt: string | null;
  className?: string;
};

export function StudentCourseAccessChip({
  courseTitle,
  expiresAt,
  className,
}: StudentCourseAccessChipProps) {
  const active = isEnrollmentActive(expiresAt);

  return (
    <div
      className={cn(
        'flex min-w-[160px] max-w-[220px] items-center justify-between gap-2 rounded-lg border px-3 py-2',
        active ? 'border-border/60 bg-background' : 'border-destructive/20 bg-destructive/[0.04]',
        className
      )}
    >
      <p className="min-w-0 truncate text-xs font-medium leading-tight">{courseTitle}</p>
      <EnrollmentAccessHint expiresAt={expiresAt} className="shrink-0" />
    </div>
  );
}
