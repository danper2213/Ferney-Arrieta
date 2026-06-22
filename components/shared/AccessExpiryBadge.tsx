import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  formatShortExpiryDate,
  getAccessExpiryStatus,
  getAccessRemainingLabel,
  type AccessExpiryStatus,
} from '@/lib/enrollment-access';
import { Clock, CalendarCheck } from 'lucide-react';

const statusStyles: Record<
  AccessExpiryStatus,
  { variant: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string }
> = {
  unlimited: { variant: 'secondary', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' },
  active: { variant: 'outline', className: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400' },
  expiring_soon: { variant: 'outline', className: 'border-amber-500/50 text-amber-700 dark:text-amber-400' },
  critical: { variant: 'destructive' },
  expired: { variant: 'destructive', className: 'opacity-80' },
};

type AccessExpiryBadgeProps = {
  expiresAt: string | null | undefined;
  showDate?: boolean;
  size?: 'sm' | 'md';
  className?: string;
};

export function AccessExpiryBadge({
  expiresAt,
  showDate = false,
  size = 'sm',
  className,
}: AccessExpiryBadgeProps) {
  const status = getAccessExpiryStatus(expiresAt);
  const style = statusStyles[status];
  const label = getAccessRemainingLabel(expiresAt);

  return (
    <Badge
      variant={style.variant}
      className={cn(
        'gap-1 font-normal',
        size === 'sm' ? 'text-xs' : 'text-sm',
        style.className,
        className
      )}
    >
      {status === 'unlimited' ? (
        <CalendarCheck className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      {label}
      {showDate && expiresAt && status !== 'expired' && status !== 'unlimited' && (
        <span className="opacity-70">· {formatShortExpiryDate(expiresAt)}</span>
      )}
    </Badge>
  );
}
