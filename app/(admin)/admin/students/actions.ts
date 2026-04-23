'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type DeleteStudentResult = { success: true } | { error: string };

export async function deleteStudent(studentUserId: string): Promise<DeleteStudentResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'No autorizado. Inicia sesión.' };
  }

  if (!studentUserId || studentUserId === user.id) {
    return { error: 'No puedes eliminar tu propia cuenta desde aquí.' };
  }

  const { data: actorProfile, error: actorError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (actorError || !actorProfile) {
    return { error: 'No se pudo verificar tu rol.' };
  }

  if ((actorProfile as { role?: string }).role !== 'master') {
    return { error: 'Solo el administrador (master) puede eliminar estudiantes.' };
  }

  const { data: target, error: targetError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', studentUserId)
    .maybeSingle();

  if (targetError || !target) {
    return { error: 'El estudiante no existe.' };
  }

  if ((target as { role?: string }).role !== 'student') {
    return { error: 'Solo se pueden eliminar cuentas con rol estudiante.' };
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc('delete_student_as_master', {
    p_target_user_id: studentUserId,
  });

  const rpcMissing =
    !!rpcError &&
    (rpcError.code === '42883' ||
      (rpcError.message ?? '').toLowerCase().includes('function') ||
      (rpcError.message ?? '').includes('delete_student_as_master'));

  let rpcPayload: { success?: boolean; error?: string } | null = null;
  if (!rpcError && rpcData != null) {
    if (typeof rpcData === 'object') {
      rpcPayload = rpcData as { success?: boolean; error?: string };
    } else if (typeof rpcData === 'string') {
      try {
        rpcPayload = JSON.parse(rpcData) as { success?: boolean; error?: string };
      } catch {
        rpcPayload = null;
      }
    }
  }

  if (rpcPayload) {
    const payload = rpcPayload;
    if (payload.success === true) {
      revalidatePath('/admin/students');
      return { success: true };
    }
    if (payload.error) {
      return { error: payload.error };
    }
  } else if (rpcError && !rpcMissing) {
    console.error('deleteStudent rpc:', rpcError);
    return { error: rpcError.message || 'Error al eliminar el estudiante' };
  }

  const { error: enrollErr } = await supabase.from('enrollments').delete().eq('user_id', studentUserId);
  if (enrollErr) {
    console.error('deleteStudent enrollments:', enrollErr);
    return { error: enrollErr.message || 'No se pudieron eliminar las inscripciones.' };
  }

  const { error: commentsErr } = await supabase.from('comments').delete().eq('user_id', studentUserId);
  if (commentsErr) {
    console.error('deleteStudent comments:', commentsErr);
    return { error: commentsErr.message || 'No se pudieron eliminar los comentarios del alumno.' };
  }

  const { error: progressErr } = await supabase.from('progress').delete().eq('user_id', studentUserId);
  if (progressErr) {
    console.error('deleteStudent progress:', progressErr);
    return { error: progressErr.message || 'No se pudo eliminar el progreso del alumno.' };
  }

  const { data: deletedRows, error: profileErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', studentUserId)
    .eq('role', 'student')
    .select('id');

  if (profileErr) {
    console.error('deleteStudent profile:', profileErr);
    return {
      error:
        profileErr.message ||
        'No se pudo eliminar el perfil. Aplica las migraciones SQL (delete_student_as_master o políticas RLS de DELETE) en Supabase.',
    };
  }

  if (!deletedRows?.length) {
    return {
      error:
        'No se eliminó ningún perfil (RLS o permisos). Aplica la migración delete_student_as_master en Supabase.',
    };
  }

  revalidatePath('/admin/students');
  return { success: true };
}

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
