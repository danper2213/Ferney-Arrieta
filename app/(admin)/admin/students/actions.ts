'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleEnrollment(
  userId: string,
  courseId: string,
  isActive: boolean
) {
  const supabase = await createClient();

  if (isActive) {
    const { error } = await supabase.from('enrollments').insert({
      user_id: userId,
      course_id: courseId,
    });
    if (error) {
      console.error('Error al inscribir:', error);
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);
    if (error) {
      console.error('Error al quitar inscripción:', error);
      return { error: error.message };
    }
  }

  revalidatePath('/admin/students');
  return { success: true };
}
