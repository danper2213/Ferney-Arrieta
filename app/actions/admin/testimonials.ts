'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { deleteBunnyVideo } from '@/app/actions/bunny';
import { normalizeBunnyVideoId } from '@/lib/bunny/token';

export type TestimonialActionResult = {
  success: boolean;
  error?: string;
};

async function assertMaster() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, error: 'No autorizado. Inicia sesión.' as const };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { supabase, error: 'No se pudo verificar tu rol.' as const };
  }

  if ((profile as { role?: string }).role !== 'master') {
    return { supabase, error: 'Solo el administrador puede gestionar testimonios.' as const };
  }

  return { supabase, error: null };
}

export async function saveTestimonial(
  _prev: TestimonialActionResult | null,
  formData: FormData,
): Promise<TestimonialActionResult> {
  const { supabase, error: authMsg } = await assertMaster();
  if (authMsg) return { success: false, error: authMsg };

  const id = String(formData.get('id') ?? '').trim();
  const personName = String(formData.get('person_name') ?? '').trim();
  const country = String(formData.get('country') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const videoProviderId = normalizeBunnyVideoId(
    String(formData.get('video_provider_id') ?? ''),
  );

  if (!personName || !country || !description) {
    return {
      success: false,
      error: 'Nombre, país y descripción son obligatorios.',
    };
  }

  if (!videoProviderId) {
    return {
      success: false,
      error: 'Debes subir el video del testimonio antes de guardar.',
    };
  }

  let previousVideoId: string | null = null;

  if (id) {
    const { data: existing } = await supabase
      .from('testimonials')
      .select('video_provider_id')
      .eq('id', id)
      .maybeSingle();

    previousVideoId = (existing as { video_provider_id?: string } | null)?.video_provider_id ?? null;
  } else {
    const { data: lastRow } = await supabase
      .from('testimonials')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder =
      ((lastRow as { order_index?: number } | null)?.order_index ?? -1) + 1;

    const { error } = await supabase.from('testimonials').insert({
      person_name: personName,
      country,
      description,
      video_provider_id: videoProviderId,
      order_index: nextOrder,
      is_active: true,
    });

    if (error) {
      console.error('Error al crear testimonio:', error);
      return { success: false, error: 'No se pudo crear el testimonio.' };
    }

    revalidatePath('/admin/testimonials');
    revalidatePath('/');
    return { success: true };
  }

  const { error } = await supabase
    .from('testimonials')
    .update({
      person_name: personName,
      country,
      description,
      video_provider_id: videoProviderId,
      thumbnail_url: null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar testimonio:', error);
    return { success: false, error: 'No se pudo actualizar el testimonio.' };
  }

  if (
    previousVideoId &&
    normalizeBunnyVideoId(previousVideoId) !== videoProviderId
  ) {
    await deleteBunnyVideo(previousVideoId);
  }

  revalidatePath('/admin/testimonials');
  revalidatePath('/');

  return { success: true };
}

export async function deleteTestimonial(id: string): Promise<TestimonialActionResult> {
  const { supabase, error: authMsg } = await assertMaster();
  if (authMsg) return { success: false, error: authMsg };

  const { data: existing } = await supabase
    .from('testimonials')
    .select('video_provider_id')
    .eq('id', id)
    .maybeSingle();

  const videoId = (existing as { video_provider_id?: string } | null)?.video_provider_id;

  const { error } = await supabase.from('testimonials').delete().eq('id', id);

  if (error) {
    console.error('Error al eliminar testimonio:', error);
    return { success: false, error: 'No se pudo eliminar el testimonio.' };
  }

  if (videoId) {
    await deleteBunnyVideo(videoId);
  }

  revalidatePath('/admin/testimonials');
  revalidatePath('/');

  return { success: true };
}
