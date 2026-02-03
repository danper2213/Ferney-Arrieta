'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type PostCommentState = {
  error?: string;
  success?: boolean;
};

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

    const { error: upsertError } = await supabase
      .from('progress')
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,lesson_id',
          ignoreDuplicates: false,
        }
      );

    if (upsertError) {
      console.error('Error al marcar lección:', upsertError);
      const err = upsertError as { message?: string };
      return { success: false, error: err?.message ?? 'Error al marcar la lección' };
    }

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
