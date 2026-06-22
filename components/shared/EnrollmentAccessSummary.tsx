'use client';

import { Progress } from '@/components/ui/progress';
import {
  formatExpiryDate,
  formatShortExpiryDate,
  getAccessExpiryStatus,
  getAccessProgressFromDuration,
  getAccessProgressPercent,
  getAccessRemainingLabel,
  getDaysUntilExpiry,
} from '@/lib/enrollment-access';
import { cn } from '@/lib/utils';
import { CalendarCheck, Clock, Infinity as InfinityIcon } from 'lucide-react';

type EnrollmentAccessSummaryProps = {
  expiresAt: string | null | undefined;
  /** Duración fijada (admin). Si existe, la barra usa días restantes / duración. */
  accessDays?: number | null;
  /** Inicio del acceso (dashboard estudiante). Fallback para la barra de progreso. */
  createdAt?: string | null;
  /** compact: una línea discreta (p. ej. dashboard estudiante). default: tarjeta completa (admin). */
  variant?: 'default' | 'compact';
  className?: string;
};

const statusAccent: Record<
  ReturnType<typeof getAccessExpiryStatus>,
  string
> = {
  unlimited: 'border-slate-500/20 bg-slate-500/5',
  active: 'border-emerald-500/25 bg-emerald-500/[0.04]',
  expiring_soon: 'border-amber-500/30 bg-amber-500/[0.06]',
  critical: 'border-destructive/30 bg-destructive/[0.06]',
  expired: 'border-destructive/25 bg-destructive/[0.05]',
};

const statusText: Record<ReturnType<typeof getAccessExpiryStatus>, string> = {
  unlimited: 'text-slate-600 dark:text-slate-300',
  active: 'text-emerald-700 dark:text-emerald-400',
  expiring_soon: 'text-amber-700 dark:text-amber-400',
  critical: 'text-destructive',
  expired: 'text-destructive',
};

export function EnrollmentAccessSummary({
  expiresAt,
  accessDays,
  createdAt,
  variant = 'default',
  className,
}: EnrollmentAccessSummaryProps) {
  const status = getAccessExpiryStatus(expiresAt);
  const label = getAccessRemainingLabel(expiresAt);
  const progress =
    accessDays != null && accessDays > 0
      ? getAccessProgressFromDuration(expiresAt, accessDays)
      : getAccessProgressPercent(expiresAt, createdAt);

  if (variant === 'compact') {
    const showDate =
      expiresAt &&
      status !== 'unlimited' &&
      (status === 'expiring_soon' || status === 'critical' || status === 'expired');

    return (
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground',
          className
        )}
      >
        <EnrollmentAccessHint expiresAt={expiresAt} />
        {showDate && (
          <span className="shrink-0">
            {status === 'expired' ? 'Finalizó' : 'Hasta'}{' '}
            {formatShortExpiryDate(expiresAt!)}
          </span>
        )}
        {status === 'unlimited' && (
          <span className="text-muted-foreground/80">Acceso sin vencimiento</span>
        )}
        {status === 'active' && expiresAt && (
          <span className="hidden sm:inline text-muted-foreground/70">{label}</span>
        )}
      </div>
    );
  }

  const Icon =
    status === 'unlimited' ? InfinityIcon : status === 'expired' ? Clock : CalendarCheck;

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3.5',
        statusAccent[status],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/60',
            statusText[status]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Tiempo de acceso
            </p>
            <p className={cn('text-base font-semibold leading-tight', statusText[status])}>
              {label}
            </p>
          </div>

          {status !== 'unlimited' && status !== 'expired' && progress != null && (
            <Progress value={progress} className="h-1.5" />
          )}

          {expiresAt && status !== 'unlimited' && (
            <p className="text-xs text-muted-foreground">
              {status === 'expired' ? 'Finalizó el' : 'Válido hasta el'}{' '}
              <span className="font-medium text-foreground/80">
                {formatExpiryDate(expiresAt)}
              </span>
              {accessDays != null && accessDays > 0 && status !== 'expired' && (
                <span className="text-muted-foreground/80"> · plan de {accessDays} días</span>
              )}
            </p>
          )}

          {status === 'unlimited' && (
            <p className="text-xs text-muted-foreground">
              Sin fecha de vencimiento para este curso.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Indicador mínimo para listas (tabla admin). */
export function EnrollmentAccessHint({
  expiresAt,
  className,
}: {
  expiresAt: string | null | undefined;
  className?: string;
}) {
  const status = getAccessExpiryStatus(expiresAt);
  const days = getDaysUntilExpiry(expiresAt);

  let text = getAccessRemainingLabel(expiresAt);
  if (status === 'active' && days != null && days > 30) {
    text = `${days} días`;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs',
        status === 'expired' && 'text-destructive',
        status === 'critical' && 'text-destructive',
        status === 'expiring_soon' && 'text-amber-600 dark:text-amber-400',
        status === 'active' && 'text-emerald-600 dark:text-emerald-400',
        status === 'unlimited' && 'text-muted-foreground',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 shrink-0 rounded-full',
          status === 'expired' && 'bg-destructive',
          status === 'critical' && 'bg-destructive',
          status === 'expiring_soon' && 'bg-amber-500',
          status === 'active' && 'bg-emerald-500',
          status === 'unlimited' && 'bg-slate-400'
        )}
      />
      {text}
    </span>
  );
}
