'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CreateModuleState = {
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

    // Obtener el orden del último módulo
    const { data: lastModule } = await supabase
      .from('modules')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

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

    // Verificar que el módulo existe y obtener el course_id
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id, course_id')
      .eq('id', moduleId)
      .maybeSingle();

    if (moduleError || !module) {
      return {
        error: 'El módulo no existe',
      };
    }

    // Obtener el orden de la última lección
    const { data: lastLesson } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

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
