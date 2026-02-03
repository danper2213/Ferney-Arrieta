'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ManageEnrollmentResult = { success: true } | { error: string };

export async function manageEnrollment(
  userId: string,
  courseId: string,
  action: 'grant' | 'revoke'
): Promise<ManageEnrollmentResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'No autorizado. Inicia sesión.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: 'No se pudo verificar tu rol.' };
  }

  const role = (profile as { role?: string }).role;
  if (role !== 'master') {
    return { error: 'Solo el administrador (master) puede gestionar accesos.' };
  }

  if (action === 'grant') {
    const { error } = await supabase.from('enrollments').insert({
      user_id: userId,
      course_id: courseId,
    });
    if (error) {
      if (error.code === '23505') {
        revalidatePath('/admin/students');
        return { success: true };
      }
      console.error('Error al asignar acceso:', error);
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);
    if (error) {
      console.error('Error al quitar acceso:', error);
      return { error: error.message };
    }
  }

  revalidatePath('/admin/students');
  return { success: true };
}
