'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type DeleteCourseResult = { success: true } | { error: string };

/**
 * Extrae el path del bucket desde una URL de Supabase Storage o devuelve el path si ya lo es.
 * Ej: "https://xxx.supabase.co/storage/v1/object/public/thumbnails/abc/file.jpg" -> "abc/file.jpg"
 */
function getStoragePath(thumbnailPathOrUrl: string): string | null {
  if (!thumbnailPathOrUrl || !thumbnailPathOrUrl.trim()) return null;
  const trimmed = thumbnailPathOrUrl.trim();
  const match = trimmed.match(/thumbnails\/(.+)$/);
  return match ? match[1] : trimmed;
}

export async function deleteCourse(
  courseId: string,
  thumbnailPath: string
): Promise<DeleteCourseResult> {
  try {
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
      return { error: 'No tienes permiso para eliminar cursos.' };
    }

    const storagePath = getStoragePath(thumbnailPath);
    if (storagePath) {
      await supabase.storage.from('thumbnails').remove([storagePath]);
      // Ignoramos errores de storage (ej. archivo ya no existe o bucket distinto)
    }

    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (deleteError) {
      console.error('Error al eliminar curso:', deleteError);
      const err = deleteError as { message?: string; details?: string };
      return {
        error: err?.message || err?.details || 'Error al eliminar el curso.',
      };
    }

    revalidatePath('/admin/courses');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error inesperado al eliminar curso:', error);
    return { error: 'Error inesperado al eliminar el curso.' };
  }
}
