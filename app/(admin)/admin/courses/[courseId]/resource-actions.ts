'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  buildLessonResourceStoragePath,
  getResourceTypeFromMime,
  LESSON_RESOURCES_BUCKET,
  MAX_RESOURCE_SIZE_BYTES,
  sanitizeResourceFileName,
  type LessonResourceType,
} from '@/lib/lesson-resources';

export type ResourceMutationState = {
  error?: string;
  success?: boolean;
  uploadedCount?: number;
};

export type RegisterLessonResourceInput = {
  resourceId: string;
  lessonId: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  resourceType: LessonResourceType;
  fileSize: number;
};

async function getLessonCourseId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lessonId: string
): Promise<string | null> {
  const { data: lesson } = await supabase
    .from('lessons')
    .select('module_id')
    .eq('id', lessonId)
    .maybeSingle();

  if (!lesson?.module_id) return null;

  const { data: module } = await supabase
    .from('modules')
    .select('course_id')
    .eq('id', lesson.module_id)
    .maybeSingle();

  return module?.course_id ?? null;
}

async function assertMaster(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ error: string } | { userId: string }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Debes iniciar sesión' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'master') {
    return { error: 'No tienes permisos para gestionar recursos' };
  }

  return { userId: user.id };
}

export async function registerLessonResource(
  input: RegisterLessonResourceInput
): Promise<ResourceMutationState> {
  const { resourceId, lessonId, fileName, storagePath, mimeType, resourceType, fileSize } = input;

  if (!lessonId || !resourceId || !storagePath || !fileName) {
    return { error: 'Datos del recurso incompletos' };
  }

  const expectedPath = buildLessonResourceStoragePath(lessonId, resourceId, fileName);
  if (storagePath !== expectedPath) {
    return { error: 'Ruta de almacenamiento no válida' };
  }

  if (fileSize <= 0 || fileSize > MAX_RESOURCE_SIZE_BYTES) {
    return { error: 'Tamaño de archivo no válido' };
  }

  const derivedType = getResourceTypeFromMime(mimeType);
  if (!derivedType || derivedType !== resourceType) {
    return { error: 'Tipo de archivo no compatible' };
  }

  try {
    const supabase = await createClient();
    const auth = await assertMaster(supabase);
    if ('error' in auth) return { error: auth.error };

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonError || !lesson) {
      return { error: 'La lección no existe' };
    }

    const { data: lastResource } = await supabase
      .from('lesson_resources')
      .select('order_index')
      .eq('lesson_id', lessonId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (lastResource?.order_index ?? -1) + 1;
    const safeName = sanitizeResourceFileName(fileName);
    const title = safeName.replace(/\.[^.]+$/, '') || safeName;

    const { error: insertError } = await supabase.from('lesson_resources').insert({
      id: resourceId,
      lesson_id: lessonId,
      title,
      file_name: safeName,
      storage_path: storagePath,
      mime_type: mimeType,
      resource_type: resourceType,
      file_size: fileSize,
      order_index: nextOrder,
    });

    if (insertError) {
      const err = insertError as { message?: string; details?: string };
      return {
        error: err?.message || err?.details || 'No se pudo registrar el recurso',
      };
    }

    const courseId = await getLessonCourseId(supabase, lessonId);
    if (courseId) {
      revalidatePath(`/admin/courses/${courseId}`);
    }
    revalidatePath('/admin/courses');

    return { success: true, uploadedCount: 1 };
  } catch (error) {
    console.error('registerLessonResource error:', error);
    return { error: 'Error inesperado al registrar el recurso' };
  }
}

export async function deleteLessonResource(resourceId: string): Promise<ResourceMutationState> {
  if (!resourceId) {
    return { error: 'Recurso no válido' };
  }

  try {
    const supabase = await createClient();
    const auth = await assertMaster(supabase);
    if ('error' in auth) return { error: auth.error };

    const { data: resource, error: fetchError } = await supabase
      .from('lesson_resources')
      .select('id, lesson_id, storage_path')
      .eq('id', resourceId)
      .maybeSingle();

    if (fetchError || !resource) {
      return { error: 'El recurso no existe' };
    }

    const { error: storageError } = await supabase.storage
      .from(LESSON_RESOURCES_BUCKET)
      .remove([resource.storage_path]);

    if (storageError) {
      console.error('deleteLessonResource storage error:', storageError);
    }

    const { error: deleteError } = await supabase
      .from('lesson_resources')
      .delete()
      .eq('id', resourceId);

    if (deleteError) {
      const err = deleteError as { message?: string; details?: string };
      return { error: err?.message || err?.details || 'No se pudo eliminar el recurso' };
    }

    const courseId = await getLessonCourseId(supabase, resource.lesson_id);
    if (courseId) {
      revalidatePath(`/admin/courses/${courseId}`);
    }

    return { success: true };
  } catch (error) {
    console.error('deleteLessonResource error:', error);
    return { error: 'Error inesperado al eliminar el recurso' };
  }
}

export async function getLessonResourceSignedUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(LESSON_RESOURCES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    console.error('getLessonResourceSignedUrl error:', error);
    return null;
  }

  return data.signedUrl;
}
