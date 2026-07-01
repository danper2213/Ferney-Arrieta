'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { normalizeProgramContent } from '@/lib/course-program-content';

export async function updateCourseProgramContent(
  courseId: string,
  content: string
): Promise<{ success: true } | { error: string }> {
  if (!courseId) return { error: 'Curso no válido' };

  const programContent = normalizeProgramContent(content);

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
    return { error: 'Solo el administrador puede editar este contenido' };
  }

  const { data: course } = await supabase
    .from('courses')
    .select('slug')
    .eq('id', courseId)
    .maybeSingle();

  if (!course) return { error: 'Curso no encontrado' };

  const { error } = await supabase
    .from('courses')
    .update({ program_content: programContent || null })
    .eq('id', courseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/');

  return { success: true };
}
