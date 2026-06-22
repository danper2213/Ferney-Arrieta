type SupabaseErrorLike = {
  code?: string;
  message?: string;
} | null;

/** PostgreSQL 42703: undefined_column — p. ej. migración de acceso aún no aplicada. */
export function isMissingColumnError(error: SupabaseErrorLike): boolean {
  if (!error) return false;
  if (error.code === '42703') return true;
  const message = (error.message ?? '').toLowerCase();
  return message.includes('does not exist') && message.includes('column');
}

export const ENROLLMENT_EXPIRY_MIGRATION =
  'supabase/migrations/20250621130000_enrollment_access_expiry.sql';

export const ENROLLMENT_EXPIRY_MIGRATION_HINT =
  'Aplica en Supabase: 20250621130000_enrollment_access_expiry.sql (columna expires_at) y 20250621160000_enrollments_update_rls.sql (permiso UPDATE para master).';
