'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateCourseDefaultAccessDays(  courseId: string,
  accessDays: number | null
): Promise<{ success: true } | { error: string }> {  if (!courseId) return { error: 'Curso no válido' };

  if (accessDays != null && accessDays <= 0) {
    return { error: 'Los días deben ser mayores a 0' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'master') {
    return { error: 'Solo el administrador puede modificar esto' };
  }

  const { error } = await supabase
    .from('courses')
    .update({ default_access_days: accessDays })
    .eq('id', courseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/admin/students');
  return { success: true };
}