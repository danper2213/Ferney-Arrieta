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

  type LessonForMessage = {
    module_id: string;
    deleted_at?: string | null;
    modules: { course_id?: string; deleted_at?: string | null } | null;
  };

  let lesson: LessonForMessage | null = null;
  const { data: lessonWithSoftDelete, error: lessonFetchError } = await supabase
    .from('lessons')
    .select('module_id, deleted_at, modules!inner(course_id, deleted_at)')
    .eq('id', lessonId)
    .maybeSingle();

  if (lessonFetchError) {
    const fallback = await supabase
      .from('lessons')
      .select('module_id, modules!inner(course_id)')
      .eq('id', lessonId)
      .maybeSingle();
    if (fallback.data) {
      const nested = fallback.data.modules as unknown as
        | { course_id?: string }
        | { course_id?: string }[]
        | null;
      const moduleRow = Array.isArray(nested) ? nested[0] ?? null : nested;
      lesson = {
        module_id: fallback.data.module_id,
        deleted_at: null,
        modules: moduleRow ? { ...moduleRow, deleted_at: null } : null,
      };
    }
  } else if (lessonWithSoftDelete) {
    const nested = lessonWithSoftDelete.modules as unknown as
      | { course_id?: string; deleted_at?: string | null }
      | { course_id?: string; deleted_at?: string | null }[]
      | null;
    const moduleRow = Array.isArray(nested) ? nested[0] ?? null : nested;
    lesson = {
      module_id: lessonWithSoftDelete.module_id,
      deleted_at: lessonWithSoftDelete.deleted_at ?? null,
      modules: moduleRow,
    };
  }

  if (!lesson || lesson.deleted_at || lesson.modules?.deleted_at) {
    return { error: 'La lección no existe' };
  }

  const { error } = await supabase
    .from('lessons')
    .update({ motivational_message: trimmed || null })
    .eq('id', lessonId);

  if (error) {
    return { error: error.message };
  }

  const courseId = lesson.modules?.course_id;

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
