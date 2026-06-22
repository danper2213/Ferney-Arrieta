'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  MAX_MOTIVATIONAL_MESSAGE_LENGTH,
  trimMotivationalMessage,
} from '@/lib/course-motivational-message';

export async function updateLessonMotivationalMessage(
  lessonId: string,
  message: string
): Promise<{ success: true } | { error: string }> {
  if (!lessonId) return { error: 'Lección no válida' };

  const trimmed = trimMotivationalMessage(message);
  if (trimmed.length > MAX_MOTIVATIONAL_MESSAGE_LENGTH) {
    return { error: `El mensaje no puede superar ${MAX_MOTIVATIONAL_MESSAGE_LENGTH} caracteres` };
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
    return { error: 'Solo el administrador puede editar el mensaje' };
  }

  const { data: lesson } = await supabase
    .from('lessons')
    .select('module_id, modules!inner(course_id)')
    .eq('id', lessonId)
    .maybeSingle();

  const { error } = await supabase
    .from('lessons')
    .update({ motivational_message: trimmed || null })
    .eq('id', lessonId);

  if (error) {
    return { error: error.message };
  }

  const courseId = (lesson?.modules as { course_id?: string } | null)?.course_id;

  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}`);

    const { data: course } = await supabase
      .from('courses')
      .select('slug')
      .eq('id', courseId)
      .maybeSingle();

    if (course?.slug) {
      revalidatePath(`/course/${course.slug}/lesson/${lessonId}`);
    }
  }

  return { success: true };
}
