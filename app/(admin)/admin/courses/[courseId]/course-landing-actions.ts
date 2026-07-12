'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const updateLandingSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(120),
  description: z
    .string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(4000, 'La descripción es demasiado larga'),
  thumbnail_url: z.string().url('Debes subir una imagen válida'),
  payment_link: z
    .string()
    .trim()
    .url('El link de pago debe ser una URL válida')
    .optional()
    .or(z.literal('')),
});

export type UpdateCourseLandingState =
  | { success: true }
  | { error: string; fieldErrors?: Record<string, string[]> };

async function requireMaster() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' as const, supabase: null, user: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'master') {
    return { error: 'No autorizado' as const, supabase: null, user: null };
  }

  return { error: null, supabase, user };
}

export async function updateCourseLandingDetails(
  courseId: string,
  input: {
    title: string;
    description: string;
    thumbnail_url: string;
    payment_link?: string;
  }
): Promise<UpdateCourseLandingState> {
  const auth = await requireMaster();
  if (auth.error || !auth.supabase) {
    return { error: auth.error ?? 'No autorizado' };
  }

  const parsed = updateLandingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: 'Revisa los campos del formulario',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { title, description, thumbnail_url, payment_link } = parsed.data;

  const { error } = await auth.supabase
    .from('courses')
    .update({
      title,
      description,
      thumbnail_url,
      payment_link: payment_link?.trim() ? payment_link.trim() : null,
    })
    .eq('id', courseId);

  if (error) {
    console.error('updateCourseLandingDetails:', error);
    return { error: 'No se pudo guardar la información del programa' };
  }

  revalidatePath('/');
  revalidatePath('/admin/courses');
  revalidatePath(`/admin/courses/${courseId}`);

  return { success: true };
}
