'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { isMissingColumnError } from '@/lib/supabase/schema-fallback';

export type PostCommentState = {
  error?: string;
  success?: boolean;
};

export type SaveWatchPositionResult = {
  success: boolean;
  error?: string;
};

/**
 * Guarda el minuto actual del video (reanudación estilo Netflix).
 * No marca la lección como completada; solo actualiza posición y last_watched_at.
 */
export async function saveWatchPosition(
  lessonId: string,
  courseSlug: string,
  positionSeconds: number
): Promise<SaveWatchPositionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión' };
    }

    if (!lessonId || typeof positionSeconds !== 'number' || !Number.isFinite(positionSeconds)) {
      return { success: false, error: 'Datos inválidos' };
    }

    const safePosition = Math.max(0, Math.floor(positionSeconds));
    const now = new Date().toISOString();

    const payloadWithWatch = {
      user_id: user.id,
      lesson_id: lessonId,
      last_position_seconds: safePosition,
      last_watched_at: now,
    };

    const { error: upsertError } = await supabase
      .from('progress')
      .upsert(payloadWithWatch, {
        onConflict: 'user_id,lesson_id',
        ignoreDuplicates: false,
      });

    if (upsertError && isMissingColumnError(upsertError)) {
      // Migración aún no aplicada: no fallar la reproducción.
      return { success: false, error: 'Migración de posición pendiente' };
    }

    if (upsertError) {
      console.error('saveWatchPosition error:', upsertError);
      return { success: false, error: upsertError.message ?? 'Error al guardar posición' };
    }

    // No revalidar en cada tick: evita refrescos constantes del dashboard/sidebar.
    void courseSlug;
    return { success: true };
  } catch (error) {
    console.error('saveWatchPosition error:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

export async function postComment(
  lessonId: string,
  courseSlug: string,
  _prevState: PostCommentState,
  formData: FormData
): Promise<PostCommentState> {
  const content = String(formData.get('content') ?? '').trim();

  if (!content) {
    return { error: 'Escribe un comentario' };
  }

  if (content.length > 2000) {
    return { error: 'El comentario no puede exceder 2000 caracteres' };
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

    const { error: insertError } = await supabase.from('comments').insert({
      content,
      user_id: user.id,
      lesson_id: lessonId,
    });

    if (insertError) {
      console.error('Error al publicar comentario:', insertError);
      const err = insertError as { message?: string };
      return { error: err?.message ?? 'Error al publicar el comentario' };
    }

    revalidatePath(`/course/${courseSlug}/lesson/${lessonId}`);

    return { success: true };
  } catch (error) {
    console.error('postComment error:', error);
    return { error: 'Error inesperado al publicar' };
  }
}

export type CompleteLessonResult = {
  success: boolean;
  error?: string;
  redirectTo?: string;
};

export async function completeLesson(
  lessonId: string,
  courseSlug: string,
  nextLessonId: string | null
): Promise<CompleteLessonResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión' };
    }

    const now = new Date().toISOString();
    const completePayload = {
      user_id: user.id,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: now,
      last_position_seconds: 0,
      last_watched_at: now,
    };

    let { error: upsertError } = await supabase
      .from('progress')
      .upsert(completePayload, {
        onConflict: 'user_id,lesson_id',
        ignoreDuplicates: false,
      });

    if (upsertError && isMissingColumnError(upsertError)) {
      const fallback = await supabase.from('progress').upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: now,
        },
        {
          onConflict: 'user_id,lesson_id',
          ignoreDuplicates: false,
        }
      );
      upsertError = fallback.error;
    }

    if (upsertError) {
      console.error('Error al marcar lección:', upsertError);
      const err = upsertError as { message?: string };
      return { success: false, error: err?.message ?? 'Error al marcar la lección' };
    }

    revalidatePath('/dashboard');
    revalidatePath(`/course/${courseSlug}`);

    if (nextLessonId) {
      return {
        success: true,
        redirectTo: `/course/${courseSlug}/lesson/${nextLessonId}`,
      };
    }

    return {
      success: true,
      redirectTo: '/dashboard',
    };
  } catch (error) {
    console.error('completeLesson error:', error);
    return { success: false, error: 'Error inesperado' };
  }
}
