export const DEFAULT_ACCESS_DAYS = 365;
export const EXPIRING_SOON_DAYS = 30;
export const CRITICAL_DAYS = 7;

export type AccessExpiryStatus =
  | 'unlimited'
  | 'active'
  | 'expiring_soon'
  | 'critical'
  | 'expired';

export type EnrollmentAccessInfo = {
  expiresAt: string | null;
  createdAt: string;
};

export function isEnrollmentActive(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

export function getDaysUntilExpiry(expiresAt: string | null | undefined): number | null {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getAccessExpiryStatus(
  expiresAt: string | null | undefined
): AccessExpiryStatus {
  if (!expiresAt) return 'unlimited';
  const days = getDaysUntilExpiry(expiresAt);
  if (days === null) return 'unlimited';
  if (days <= 0) return 'expired';
  if (days <= CRITICAL_DAYS) return 'critical';
  if (days <= EXPIRING_SOON_DAYS) return 'expiring_soon';
  return 'active';
}

export function formatExpiryDate(expiresAt: string): string {
  return new Date(expiresAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortExpiryDate(expiresAt: string): string {
  return new Date(expiresAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function computeExpiresAt(accessDays: number, from: Date = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + accessDays);
  return date.toISOString();
}

export function extendExpiresAt(
  currentExpiresAt: string | null | undefined,
  additionalDays: number
): string {
  const base = currentExpiresAt
    ? new Date(Math.max(new Date(currentExpiresAt).getTime(), Date.now()))
    : new Date();
  base.setDate(base.getDate() + additionalDays);
  return base.toISOString();
}

export function getAccessRemainingLabel(expiresAt: string | null | undefined): string {
  const status = getAccessExpiryStatus(expiresAt);
  if (status === 'unlimited') return 'Acceso ilimitado';
  const days = getDaysUntilExpiry(expiresAt);
  if (days === null) return 'Acceso ilimitado';
  if (status === 'expired') return 'Acceso expirado';
  if (days === 1) return 'Queda 1 día';
  return `Quedan ${days} días`;
}

export function getAccessProgressPercent(
  expiresAt: string | null | undefined,
  createdAt: string | null | undefined
): number | null {
  if (!expiresAt || !createdAt) return null;
  const totalMs = new Date(expiresAt).getTime() - new Date(createdAt).getTime();
  if (totalMs <= 0) return 0;
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.min(100, Math.round((remainingMs / totalMs) * 100)));
}

/** Progreso según duración fijada (p. ej. tras cambiar acceso a 90 días desde hoy). */
export function getAccessProgressFromDuration(
  expiresAt: string | null | undefined,
  accessDays: number | null | undefined
): number | null {
  if (!expiresAt || accessDays == null || accessDays <= 0) return null;
  const daysLeft = getDaysUntilExpiry(expiresAt);
  if (daysLeft === null) return null;
  return Math.max(0, Math.min(100, Math.round((daysLeft / accessDays) * 100)));
}

export const ACCESS_DURATION_PRESETS = [
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
  { label: '6 meses', days: 180 },
  { label: '1 año', days: 365 },
  { label: 'Ilimitado', days: null as number | null },
] as const;

export function resolveDefaultAccessDays(courseDefault: number | null | undefined): number {
  if (courseDefault != null && courseDefault > 0) return courseDefault;
  return DEFAULT_ACCESS_DAYS;
}
