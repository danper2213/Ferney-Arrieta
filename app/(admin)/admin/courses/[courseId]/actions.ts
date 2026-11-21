'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { deleteBunnyVideo } from '@/app/actions/bunny';
import {
  isMissingColumnError,
  SOFT_DELETE_MIGRATION_HINT,
} from '@/lib/supabase/schema-fallback';

export type CreateModuleState = {
  error?: string;
  success?: boolean;
};

export type CourseMutationState = {
  error?: string;
  success?: boolean;
};

export async function createModule(
  courseId: string,
  _prevState: CreateModuleState,
  formData: FormData
): Promise<CreateModuleState> {
  const title = String(formData.get('title') ?? '').trim();

  if (!title) {
    return {
      error: 'El título del módulo es obligatorio',
    };
  }

  if (title.length < 3) {
    return {
      error: 'El título debe tener al menos 3 caracteres',
    };
  }

  try {
    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: 'Debes iniciar sesión para crear un módulo',
      };
    }

    // Verificar que el curso existe
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .maybeSingle();

    if (courseError || !course) {
      return {
        error: 'El curso no existe',
      };
    }

    // Obtener el orden del último módulo activo
    let lastModule: { order_index: number } | null = null;
    const { data: lastModuleActive, error: lastModuleError } = await supabase
      .from('modules')
      .select('order_index')
      .eq('course_id', courseId)
      .is('deleted_at', null)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastModuleError && isMissingColumnError(lastModuleError)) {
      const fallback = await supabase
        .from('modules')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();
      lastModule = fallback.data;
    } else {
      lastModule = lastModuleActive;
    }

    const nextOrder = (lastModule?.order_index ?? -1) + 1;

    // Insertar el módulo
    const { error: insertError } = await supabase.from('modules').insert({
      course_id: courseId,
      title,
      order_index: nextOrder,
    });

    if (insertError) {
      console.error('Error al crear el módulo:', insertError);
      const err = insertError as { message?: string; details?: string; hint?: string };
      return {
        error: err?.message || err?.details || 'Error al crear el módulo',
      };
    }

    // Revalidar la página para mostrar el nuevo módulo
    revalidatePath(`/admin/courses/${courseId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    return {
      error: 'Error inesperado al crear el módulo',
    };
  }
}

export type CreateLessonState = {
  error?: string;
  success?: boolean;
};

export async function createLesson(
  moduleId: string,
  _prevState: CreateLessonState,
  formData: FormData
): Promise<CreateLessonState> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const daysToUnlock = parseInt(String(formData.get('days_to_unlock') ?? '0'), 10);

  if (!title) {
    return {
      error: 'El título de la lección es obligatorio',
    };
  }

  if (title.length < 3) {
    return {
      error: 'El título debe tener al menos 3 caracteres',
    };
  }

  if (!description) {
    return {
      error: 'La descripción es obligatoria',
    };
  }

  if (description.length < 10) {
    return {
      error: 'La descripción debe tener al menos 10 caracteres',
    };
  }

  if (isNaN(daysToUnlock) || daysToUnlock < 0) {
    return {
      error: 'Los días para desbloquear deben ser un número positivo',
    };
  }

  try {
    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: 'Debes iniciar sesión para crear una lección',
      };
    }

    // Verificar que el módulo activo existe y obtener el course_id
    let { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id, course_id, deleted_at')
      .eq('id', moduleId)
      .maybeSingle();

    if (moduleError && isMissingColumnError(moduleError)) {
      const fallback = await supabase
        .from('modules')
        .select('id, course_id')
        .eq('id', moduleId)
        .maybeSingle();
      module = fallback.data ? { ...fallback.data, deleted_at: null } : null;
      moduleError = fallback.error;
    }

    if (moduleError || !module || module.deleted_at) {
      return {
        error: 'El módulo no existe',
      };
    }

    // Obtener el orden de la última lección activa
    let lastLesson: { order_index: number } | null = null;
    const { data: lastLessonActive, error: lastLessonError } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('module_id', moduleId)
      .is('deleted_at', null)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastLessonError && isMissingColumnError(lastLessonError)) {
      const fallback = await supabase
        .from('lessons')
        .select('order_index')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();
      lastLesson = fallback.data;
    } else {
      lastLesson = lastLessonActive;
    }

    const nextOrder = (lastLesson?.order_index ?? -1) + 1;

    // Insertar la lección (sin video_url si la columna no existe en la tabla)
    const { error: insertError } = await supabase.from('lessons').insert({
      module_id: moduleId,
      title,
      description,
      days_to_unlock: daysToUnlock,
      order_index: nextOrder,
    });

    if (insertError) {
      console.error('Error al crear la lección:', insertError);
      const err = insertError as { message?: string; details?: string; hint?: string };
      return {
        error: err?.message || err?.details || 'Error al crear la lección',
      };
    }

    // Revalidar la página para mostrar la nueva lección
    revalidatePath(`/admin/courses/${module.course_id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    return {
      error: 'Error inesperado al crear la lección',
    };
  }
}

export type UpdateLessonVideoState = {
  error?: string;
  success?: boolean;
};

export async function updateLessonVideo(
  lessonId: string,
  videoGuid: string
): Promise<UpdateLessonVideoState> {
  if (!lessonId || !videoGuid) {
    return {
      error: 'Faltan lessonId o videoGuid',
    };
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: 'Debes iniciar sesión',
      };
    }

    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, module_id')
      .eq('id', lessonId)
      .maybeSingle();

    if (fetchError || !lesson) {
      return {
        error: 'La lección no existe',
      };
    }

    const { data: mod } = await supabase
      .from('modules')
      .select('course_id')
      .eq('id', (lesson as { module_id: string }).module_id)
      .maybeSingle();

    const courseId = mod?.course_id;

    const { error: updateError } = await supabase
      .from('lessons')
      .update({ video_provider_id: videoGuid })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Error al actualizar lección:', updateError);
      const err = updateError as { message?: string; details?: string };
      return {
        error: err?.message || err?.details || 'Error al guardar el video',
      };
    }

    if (courseId) {
      revalidatePath(`/admin/courses/${courseId}`);
    }
    revalidatePath('/admin/courses');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    return {
      error: 'Error inesperado al guardar el video',
    };
  }
}

export type MoveLessonResult = { success: true } | { error: string };

/**
 * Intercambia order_index con la lección adyacente dentro del mismo módulo.
 */
export async function moveLesson(lessonId: string, direction: 'up' | 'down'): Promise<MoveLessonResult> {
  if (!lessonId || (direction !== 'up' && direction !== 'down')) {
    return { error: 'Solicitud inválida' };
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Debes iniciar sesión' };
    }

    let { data: current, error: curErr } = await supabase
      .from('lessons')
      .select('id, module_id, order_index, deleted_at')
      .eq('id', lessonId)
      .maybeSingle();

    if (curErr && isMissingColumnError(curErr)) {
      const fallback = await supabase
        .from('lessons')
        .select('id, module_id, order_index')
        .eq('id', lessonId)
        .maybeSingle();
      current = fallback.data ? { ...fallback.data, deleted_at: null } : null;
      curErr = fallback.error;
    }

    if (curErr || !current || (current as { deleted_at?: string | null }).deleted_at) {
      return { error: 'La lección no existe' };
    }

    const moduleId = (current as { module_id: string }).module_id;

    const { data: mod, error: modErr } = await supabase
      .from('modules')
      .select('course_id')
      .eq('id', moduleId)
      .maybeSingle();

    if (modErr || !mod) {
      return { error: 'El módulo no existe' };
    }

    const courseId = (mod as { course_id: string }).course_id;

    let { data: rowsRaw, error: listErr } = await supabase
      .from('lessons')
      .select('id, order_index')
      .eq('module_id', moduleId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })
      .order('id', { ascending: true });

    if (listErr && isMissingColumnError(listErr)) {
      const fallback = await supabase
        .from('lessons')
        .select('id, order_index')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true })
        .order('id', { ascending: true });
      rowsRaw = fallback.data;
      listErr = fallback.error;
    }

    if (listErr || !rowsRaw?.length) {
      return { error: 'No se pudieron cargar las lecciones del módulo' };
    }

    const rows = rowsRaw as { id: string; order_index: number }[];
    const i = rows.findIndex((r) => r.id === lessonId);
    if (i === -1) {
      return { error: 'La lección no está en el módulo' };
    }

    const j = direction === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= rows.length) {
      return { error: 'No se puede mover más en esa dirección' };
    }

    const a = rows[i];
    const b = rows[j];
    const oa = a.order_index ?? 0;
    const ob = b.order_index ?? 0;
    const temp = -2147483640 + Math.floor(Math.random() * 1000);

    const { error: e1 } = await supabase.from('lessons').update({ order_index: temp }).eq('id', a.id);
    if (e1) {
      console.error('moveLesson temp:', e1);
      return { error: e1.message || 'Error al reordenar' };
    }

    const { error: e2 } = await supabase.from('lessons').update({ order_index: oa }).eq('id', b.id);
    if (e2) {
      console.error('moveLesson step2:', e2);
      await supabase.from('lessons').update({ order_index: oa }).eq('id', a.id);
      return { error: e2.message || 'Error al reordenar' };
    }

    const { error: e3 } = await supabase.from('lessons').update({ order_index: ob }).eq('id', a.id);
    if (e3) {
      console.error('moveLesson step3:', e3);
      await supabase.from('lessons').update({ order_index: ob }).eq('id', b.id);
      await supabase.from('lessons').update({ order_index: oa }).eq('id', a.id);
      return { error: e3.message || 'Error al reordenar' };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error) {
    console.error('moveLesson error:', error);
    return { error: 'Error inesperado al reordenar' };
  }
}

export type MoveModuleResult = { success: true } | { error: string };

/**
 * Intercambia order_index con el módulo adyacente dentro del mismo curso.
 */
export async function moveModule(moduleId: string, direction: 'up' | 'down'): Promise<MoveModuleResult> {
  if (!moduleId || (direction !== 'up' && direction !== 'down')) {
    return { error: 'Solicitud inválida' };
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Debes iniciar sesión' };
    }

    let { data: current, error: curErr } = await supabase
      .from('modules')
      .select('id, course_id, order_index, deleted_at')
      .eq('id', moduleId)
      .maybeSingle();

    if (curErr && isMissingColumnError(curErr)) {
      const fallback = await supabase
        .from('modules')
        .select('id, course_id, order_index')
        .eq('id', moduleId)
        .maybeSingle();
      current = fallback.data ? { ...fallback.data, deleted_at: null } : null;
      curErr = fallback.error;
    }

    if (curErr || !current || (current as { deleted_at?: string | null }).deleted_at) {
      return { error: 'El módulo no existe' };
    }

    const courseId = (current as { course_id: string }).course_id;

    let { data: rowsRaw, error: listErr } = await supabase
      .from('modules')
      .select('id, order_index')
      .eq('course_id', courseId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })
      .order('id', { ascending: true });

    if (listErr && isMissingColumnError(listErr)) {
      const fallback = await supabase
        .from('modules')
        .select('id, order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
        .order('id', { ascending: true });
      rowsRaw = fallback.data;
      listErr = fallback.error;
    }

    if (listErr || !rowsRaw?.length) {
      return { error: 'No se pudieron cargar los módulos del curso' };
    }

    const rows = rowsRaw as { id: string; order_index: number }[];
    const i = rows.findIndex((r) => r.id === moduleId);
    if (i === -1) {
      return { error: 'El módulo no está en el curso' };
    }

    const j = direction === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= rows.length) {
      return { error: 'No se puede mover más en esa dirección' };
    }

    const a = rows[i];
    const b = rows[j];
    const oa = a.order_index ?? 0;
    const ob = b.order_index ?? 0;
    const temp = -2147483640 + Math.floor(Math.random() * 1000);

    const { error: e1 } = await supabase.from('modules').update({ order_index: temp }).eq('id', a.id);
    if (e1) {
      console.error('moveModule temp:', e1);
      return { error: e1.message || 'Error al reordenar módulos' };
    }

    const { error: e2 } = await supabase.from('modules').update({ order_index: oa }).eq('id', b.id);
    if (e2) {
      console.error('moveModule step2:', e2);
      await supabase.from('modules').update({ order_index: oa }).eq('id', a.id);
      return { error: e2.message || 'Error al reordenar módulos' };
    }

    const { error: e3 } = await supabase.from('modules').update({ order_index: ob }).eq('id', a.id);
    if (e3) {
      console.error('moveModule step3:', e3);
      await supabase.from('modules').update({ order_index: ob }).eq('id', b.id);
      await supabase.from('modules').update({ order_index: oa }).eq('id', a.id);
      return { error: e3.message || 'Error al reordenar módulos' };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error) {
    console.error('moveModule error:', error);
    return { error: 'Error inesperado al reordenar módulos' };
  }
}

export async function publishCourse(courseId: string): Promise<{ error?: string; success?: boolean }> {
  try {
    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: 'Debes iniciar sesión',
      };
    }

    // Actualizar el estado del curso a publicado
    const { error: updateError } = await supabase
      .from('courses')
      .update({ is_published: true })
      .eq('id', courseId);

    if (updateError) {
      console.error('Error al publicar el curso:', updateError);
      const err = updateError as { message?: string; details?: string };
      return {
        error: err?.message || err?.details || 'Error al publicar el curso',
      };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath('/admin/courses');
    revalidatePath('/');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    return {
      error: 'Error inesperado al publicar el curso',
    };
  }
}

export async function updateModule(
  moduleId: string,
  _prevState: CourseMutationState,
  formData: FormData
): Promise<CourseMutationState> {
  const title = String(formData.get('title') ?? '').trim();
  if (!title || title.length < 3) {
    return { error: 'El titulo del modulo debe tener al menos 3 caracteres' };
  }

  try {
    const supabase = await createClient();
    const { data: module, error: fetchError } = await supabase
      .from('modules')
      .select('id, course_id')
      .eq('id', moduleId)
      .maybeSingle();

    if (fetchError || !module) {
      return { error: 'El modulo no existe' };
    }

    const { error: updateError } = await supabase
      .from('modules')
      .update({ title })
      .eq('id', moduleId);

    if (updateError) {
      const err = updateError as { message?: string; details?: string };
      return { error: err?.message || err?.details || 'No se pudo actualizar el modulo' };
    }

    revalidatePath(`/admin/courses/${module.course_id}`);
    return { success: true };
  } catch (error) {
    console.error('updateModule error:', error);
    return { error: 'Error inesperado al actualizar el modulo' };
  }
}

export async function deleteModule(
  moduleId: string
): Promise<CourseMutationState> {
  try {
    const supabase = await createClient();
    const { data: module, error: fetchError } = await supabase
      .from('modules')
      .select('id, course_id, deleted_at')
      .eq('id', moduleId)
      .maybeSingle();

    if (fetchError) {
      if (isMissingColumnError(fetchError)) {
        return { error: SOFT_DELETE_MIGRATION_HINT };
      }
      return { error: 'El modulo no existe' };
    }

    if (!module || module.deleted_at) {
      return { error: 'El modulo no existe' };
    }

    const deletedAt = new Date().toISOString();

    const { error: lessonsSoftDeleteError } = await supabase
      .from('lessons')
      .update({ deleted_at: deletedAt })
      .eq('module_id', moduleId)
      .is('deleted_at', null);

    if (lessonsSoftDeleteError) {
      if (isMissingColumnError(lessonsSoftDeleteError)) {
        return { error: SOFT_DELETE_MIGRATION_HINT };
      }
      const err = lessonsSoftDeleteError as { message?: string; details?: string };
      return {
        error:
          err?.message ||
          err?.details ||
          'No se pudieron mover las lecciones del modulo a la papelera',
      };
    }

    const { error: moduleSoftDeleteError } = await supabase
      .from('modules')
      .update({ deleted_at: deletedAt })
      .eq('id', moduleId)
      .is('deleted_at', null);

    if (moduleSoftDeleteError) {
      if (isMissingColumnError(moduleSoftDeleteError)) {
        return { error: SOFT_DELETE_MIGRATION_HINT };
      }
      const err = moduleSoftDeleteError as { message?: string; details?: string };
      return { error: err?.message || err?.details || 'No se pudo mover el modulo a la papelera' };
    }

    revalidatePath(`/admin/courses/${module.course_id}`);
    return { success: true };
  } catch (error) {
    console.error('deleteModule error:', error);
    return { error: 'Error inesperado al eliminar el modulo' };
  }
}

export async function restoreModule(
  moduleId: string
): Promise<CourseMutationState> {
  try {
    const supabase = await createClient();
    const { data: module, error: fetchError } = await supabase
      .from('modules')
      .select('id, course_id, deleted_at')
      .eq('id', moduleId)
      .maybeSingle();

    if (fetchError) {
      if (isMissingColumnError(fetchError)) {
        return { error: SOFT_DELETE_MIGRATION_HINT };
      }
      return { error: 'El modulo no existe' };
    }

    if (!module) {
      return { error: 'El modulo no existe' };
    }

    if (!module.deleted_at) {
      return { error: 'El modulo no esta en la papelera' };
    }

    const { error: moduleRestoreError } = await supabase
      .from('modules')
      .update({ deleted_at: null })
      .eq('id', moduleId);

    if (moduleRestoreError) {
      const err = moduleRestoreError as { message?: string; details?: string };
      return { error: err?.message || err?.details || 'No se pudo restaurar el modulo' };
    }

    const { error: lessonsRestoreError } = await supabase
      .from('lessons')
      .update({ deleted_at: null })
      .eq('module_id', moduleId)
      .not('deleted_at', 'is', null);

    if (lessonsRestoreError) {
      const err = lessonsRestoreError as { message?: string; details?: string };
      return {
        error:
          err?.message ||
          err?.details ||
          'El modulo se restauro, pero no sus lecciones',
      };
    }

    revalidatePath(`/admin/courses/${module.course_id}`);
    return { success: true };
  } catch (error) {
    console.error('restoreModule error:', error);
    return { error: 'Error inesperado al restaurar el modulo' };
  }
}

export async function updateLesson(
  lessonId: string,
  _prevState: CourseMutationState,
  formData: FormData
): Promise<CourseMutationState> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const daysToUnlock = parseInt(String(formData.get('days_to_unlock') ?? '0'), 10);

  if (!title || title.length < 3) {
    return { error: 'El titulo debe tener al menos 3 caracteres' };
  }
  if (!description || description.length < 10) {
    return { error: 'La descripcion debe tener al menos 10 caracteres' };
  }
  if (isNaN(daysToUnlock) || daysToUnlock < 0) {
    return { error: 'Los dias para desbloquear deben ser 0 o mayor' };
  }

  try {
    const supabase = await createClient();
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, module_id')
      .eq('id', lessonId)
      .maybeSingle();

    if (fetchError || !lesson) {
      return { error: 'La leccion no existe' };
    }

    const { data: module } = await supabase
      .from('modules')
      .select('course_id')
      .eq('id', lesson.module_id)
      .maybeSingle();

    const { error: updateError } = await supabase
      .from('lessons')
      .update({
        title,
        description,
        days_to_unlock: daysToUnlock,
      })
      .eq('id', lessonId);

    if (updateError) {
      const err = updateError as { message?: string; details?: string };
      return { error: err?.message || err?.details || 'No se pudo actualizar la leccion' };
    }

    if (module?.course_id) {
      revalidatePath(`/admin/courses/${module.course_id}`);
    }
    return { success: true };
  } catch (error) {
    console.error('updateLesson error:', error);
    return { error: 'Error inesperado al actualizar la leccion' };
  }
}

export async function deleteLesson(
  lessonId: string
): Promise<CourseMutationState> {
  try {
    const supabase = await createClient();
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, module_id, deleted_at')
      .eq('id', lessonId)
      .maybeSingle();

    if (fetchError) {
      if (isMissingColumnError(fetchError)) {
        return { error: SOFT_DELETE_MIGRATION_HINT };
      }
      return { error: 'La leccion no existe' };
    }

    if (!lesson || lesson.deleted_at) {
      return { error: 'La leccion no existe' };
    }

    const { data: module } = await supabase
      .from('modules')
      .select('course_id')
      .eq('id', lesson.module_id)
      .maybeSingle();

    const deletedAt = new Date().toISOString();
    const { error: softDeleteError } = await supabase
      .from('lessons')
      .update({ deleted_at: deletedAt })
      .eq('id', lessonId)
      .is('deleted_at', null);

    if (softDeleteError) {
      if (isMissingColumnError(softDeleteError)) {
        return { error: SOFT_DELETE_MIGRATION_HINT };
      }
      const err = softDeleteError as { message?: string; details?: string };
      return { error: err?.message || err?.details || 'No se pudo mover la leccion a la papelera' };
    }

    if (module?.course_id) {
      revalidatePath(`/admin/courses/${module.course_id}`);
    }
    return { success: true };
  } catch (error) {
    console.error('deleteLesson error:', error);
    return { error: 'Error inesperado al eliminar la leccion' };
  }
}

export async function restoreLesson(
  lessonId: string
): Promise<CourseMutationState> {
  try {
    const supabase = await createClient();
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, module_id, deleted_at')
      .eq('id', lessonId)
      .maybeSingle();

    if (fetchError) {
      if (isMissingColumnError(fetchError)) {
        return { error: SOFT_DELETE_MIGRATION_HINT };
      }
      return { error: 'La leccion no existe' };
    }

    if (!lesson) {
      return { error: 'La leccion no existe' };
    }

    if (!lesson.deleted_at) {
      return { error: 'La leccion no esta en la papelera' };
    }

    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id, course_id, deleted_at')
      .eq('id', lesson.module_id)
      .maybeSingle();

    if (moduleError || !module) {
      return { error: 'El modulo de la leccion no existe' };
    }

    // Si el módulo padre está en papelera, restaurarlo primero (sin tocar otras lecciones).
    if (module.deleted_at) {
      const { error: moduleRestoreError } = await supabase
        .from('modules')
        .update({ deleted_at: null })
        .eq('id', module.id);

      if (moduleRestoreError) {
        const err = moduleRestoreError as { message?: string; details?: string };
        return {
          error:
            err?.message ||
            err?.details ||
            'No se pudo restaurar el modulo padre de la leccion',
        };
      }
    }

    const { error: lessonRestoreError } = await supabase
      .from('lessons')
      .update({ deleted_at: null })
      .eq('id', lessonId);

    if (lessonRestoreError) {
      const err = lessonRestoreError as { message?: string; details?: string };
      return { error: err?.message || err?.details || 'No se pudo restaurar la leccion' };
    }

    revalidatePath(`/admin/courses/${module.course_id}`);
    return { success: true };
  } catch (error) {
    console.error('restoreLesson error:', error);
    return { error: 'Error inesperado al restaurar la leccion' };
  }
}

export async function removeLessonVideo(
  lessonId: string
): Promise<CourseMutationState> {
  try {
    const supabase = await createClient();
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, module_id, video_provider_id')
      .eq('id', lessonId)
      .maybeSingle();

    if (fetchError || !lesson) {
      return { error: 'La leccion no existe' };
    }

    const { data: module } = await supabase
      .from('modules')
      .select('course_id')
      .eq('id', lesson.module_id)
      .maybeSingle();

    const videoGuid = lesson.video_provider_id;
    if (videoGuid) {
      const bunnyDelete = await deleteBunnyVideo(videoGuid);
      if (!bunnyDelete.success) {
        return { error: bunnyDelete.error };
      }
    }

    const { error: updateError } = await supabase
      .from('lessons')
      .update({ video_provider_id: null })
      .eq('id', lessonId);

    if (updateError) {
      const err = updateError as { message?: string; details?: string };
      return { error: err?.message || err?.details || 'No se pudo limpiar el video en la leccion' };
    }

    if (module?.course_id) {
      revalidatePath(`/admin/courses/${module.course_id}`);
    }
    return { success: true };
  } catch (error) {
    console.error('removeLessonVideo error:', error);
    return { error: 'Error inesperado al eliminar el video' };
  }
}
