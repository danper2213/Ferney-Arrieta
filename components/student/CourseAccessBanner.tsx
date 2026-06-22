import { getAccessExpiryStatus, getAccessRemainingLabel } from '@/lib/enrollment-access';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type CourseAccessBannerProps = {
  expiresAt: string | null;
};

export function CourseAccessBanner({ expiresAt }: CourseAccessBannerProps) {
  const status = getAccessExpiryStatus(expiresAt);
  if (status !== 'expiring_soon' && status !== 'critical') {
    return null;
  }

  const critical = status === 'critical';

  return (
    <div
      className={cn(
        'border-b px-4 py-2.5',
        critical
          ? 'border-destructive/30 bg-destructive/10'
          : 'border-amber-500/30 bg-amber-500/10'
      )}
    >
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 text-sm">
        <AlertTriangle
          className={cn('h-4 w-4 shrink-0', critical ? 'text-destructive' : 'text-amber-600')}
        />
        <span
          className={cn(
            critical ? 'text-destructive' : 'text-amber-800 dark:text-amber-200'
          )}
        >
          Tu acceso a este curso está por vencer —{' '}
          <span className="font-semibold">{getAccessRemainingLabel(expiresAt)}</span>
        </span>
      </div>
    </div>
  );
}
