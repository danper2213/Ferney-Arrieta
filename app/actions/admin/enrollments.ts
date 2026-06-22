'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  computeExpiresAt,
  extendExpiresAt,
  resolveDefaultAccessDays,
} from '@/lib/enrollment-access';
import {
  ENROLLMENT_EXPIRY_MIGRATION_HINT,
  isMissingColumnError,
} from '@/lib/supabase/schema-fallback';

export type ManageEnrollmentResult =
  | { success: true; expiresAt: string | null; removed?: boolean }
  | { error: string };

type AssertMasterResult =
  | { ok: true }
  | { ok: false; error: string };

async function assertMaster(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AssertMasterResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: 'No autorizado. Inicia sesión.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { ok: false, error: 'No se pudo verificar tu rol.' };
  }

  if ((profile as { role?: string }).role !== 'master') {
    return { ok: false, error: 'Solo el administrador (master) puede gestionar accesos.' };
  }

  return { ok: true };
}

function enrollmentUpdateBlockedMessage(): string {
  return (
    'No se pudo guardar el cambio. Aplica las migraciones de acceso en Supabase ' +
    '(20250621130000_enrollment_access_expiry.sql y 20250621160000_enrollments_update_rls.sql) ' +
    'y verifica que tu usuario tenga rol master.'
  );
}

async function persistEnrollmentExpiry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  courseId: string,
  expiresAt: string | null
): Promise<ManageEnrollmentResult> {
  const { data, error } = await supabase
    .from('enrollments')
    .update({ expires_at: expiresAt })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .select('expires_at')
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error)) {
      return { error: ENROLLMENT_EXPIRY_MIGRATION_HINT };
    }
    return { error: error.message };
  }

  if (!data) {
    return { error: enrollmentUpdateBlockedMessage() };
  }

  return {
    success: true,
    expiresAt: (data as { expires_at?: string | null }).expires_at ?? null,
  };
}

export async function grantEnrollment(
  userId: string,
  courseId: string,
  accessDays: number | null
): Promise<ManageEnrollmentResult> {
  const supabase = await createClient();
  const auth = await assertMaster(supabase);
  if (!auth.ok) return { error: auth.error };

  const expiresAt =
    accessDays != null && accessDays > 0 ? computeExpiresAt(accessDays) : null;

  const { error } = await supabase.from('enrollments').insert({
    user_id: userId,
    course_id: courseId,
    expires_at: expiresAt,
  });

  if (error) {
    if (error.code === '23505') {
      const result = await persistEnrollmentExpiry(supabase, userId, courseId, expiresAt);
      if ('error' in result) return result;
      revalidatePath('/admin/students');
      revalidatePath('/dashboard');
      return result;
    } else {
      console.error('grantEnrollment error:', error);
      return { error: error.message };
    }
  }

  revalidatePath('/admin/students');
  revalidatePath('/dashboard');
  return { success: true, expiresAt };
}

export async function revokeEnrollment(
  userId: string,
  courseId: string
): Promise<ManageEnrollmentResult> {
  const supabase = await createClient();
  const auth = await assertMaster(supabase);
  if (!auth.ok) return { error: auth.error };

  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) {
    console.error('revokeEnrollment error:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/students');
  revalidatePath('/dashboard');
  return { success: true, expiresAt: null, removed: true };
}
export async function updateEnrollmentDuration(
  userId: string,
  courseId: string,
  accessDays: number | null
): Promise<ManageEnrollmentResult> {
  const supabase = await createClient();
  const auth = await assertMaster(supabase);
  if (!auth.ok) return { error: auth.error };

  const { data: existing, error: fetchError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (fetchError) {
    if (isMissingColumnError(fetchError)) {
      return { error: ENROLLMENT_EXPIRY_MIGRATION_HINT };
    }
    return { error: fetchError.message };
  }

  if (!existing) {
    return { error: 'El estudiante no tiene acceso a este curso' };
  }

  const expiresAt =
    accessDays != null && accessDays > 0 ? computeExpiresAt(accessDays) : null;

  const result = await persistEnrollmentExpiry(supabase, userId, courseId, expiresAt);
  if ('error' in result) return result;

  revalidatePath('/admin/students');
  revalidatePath('/dashboard');
  return result;
}

/** @deprecated Usar updateEnrollmentDuration */
export async function extendEnrollment(
  userId: string,
  courseId: string,
  additionalDays: number
): Promise<ManageEnrollmentResult> {
  if (additionalDays <= 0) {
    return { error: 'Los días adicionales deben ser mayores a 0' };
  }

  const supabase = await createClient();
  const auth = await assertMaster(supabase);
  if (!auth.ok) return { error: auth.error };

  const { data: enrollment, error: fetchError } = await supabase
    .from('enrollments')
    .select('expires_at')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (fetchError || !enrollment) {
    return { error: 'El estudiante no tiene acceso a este curso' };
  }

  const newExpiresAt = extendExpiresAt(
    (enrollment as { expires_at?: string | null }).expires_at,
    additionalDays
  );

  const result = await persistEnrollmentExpiry(supabase, userId, courseId, newExpiresAt);
  if ('error' in result) return result;

  revalidatePath('/admin/students');
  revalidatePath('/dashboard');
  return result;
}

/** @deprecated Usar grantEnrollment / revokeEnrollment */
export async function manageEnrollment(
  userId: string,
  courseId: string,
  action: 'grant' | 'revoke'
): Promise<ManageEnrollmentResult> {
  if (action === 'grant') {
    const supabase = await createClient();
    const { data: course } = await supabase
      .from('courses')
      .select('default_access_days')
      .eq('id', courseId)
      .maybeSingle();
    const days = resolveDefaultAccessDays(
      (course as { default_access_days?: number | null } | null)?.default_access_days
    );
    return grantEnrollment(userId, courseId, days);
  }
  return revokeEnrollment(userId, courseId);
}
