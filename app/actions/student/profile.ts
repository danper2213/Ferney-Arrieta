'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type UpdateProfileResult = { success: true } | { error: string };
export type UpdatePasswordResult = { success: true } | { error: string };

export async function updateProfile(
  formData: FormData
): Promise<UpdateProfileResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'No autorizado. Inicia sesión.' };
    }

    const fullName = String(formData.get('full_name') ?? '').trim();
    const avatarFile = formData.get('avatarFile') as File | null;

    let avatarUrl: string | null = null;

    if (avatarFile && avatarFile.size > 0) {
      const ext = avatarFile.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error al subir avatar:', uploadError);
        return {
          error: 'Error al subir la imagen. Comprueba que el bucket "avatars" exista y sea público.',
        };
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);
      avatarUrl = urlData.publicUrl;
    }

    const updates: { display_name: string; avatar_url?: string } = {
      display_name: fullName || ((user.user_metadata?.full_name as string) ?? ''),
    };
    if (avatarUrl !== null) {
      updates.avatar_url = avatarUrl;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (profileError) {
      console.error('Error al actualizar perfil:', profileError);
      const err = profileError as { message?: string };
      return { error: err?.message ?? 'Error al guardar el perfil.' };
    }

    if (avatarUrl) {
      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error inesperado en updateProfile:', error);
    return { error: 'Error inesperado al actualizar el perfil.' };
  }
}

export async function updatePassword(
  newPassword: string
): Promise<UpdatePasswordResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'No autorizado. Inicia sesión.' };
    }

    const trimmed = newPassword.trim();
    if (!trimmed || trimmed.length < 6) {
      return { error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const { error } = await supabase.auth.updateUser({ password: trimmed });

    if (error) {
      console.error('Error al actualizar contraseña:', error);
      const err = error as { message?: string };
      return { error: err?.message ?? 'Error al cambiar la contraseña.' };
    }

    revalidatePath('/dashboard/profile');

    return { success: true };
  } catch (error) {
    console.error('Error inesperado en updatePassword:', error);
    return { error: 'Error inesperado al cambiar la contraseña.' };
  }
}

/** Recibe FormData con newPassword y confirmPassword; valida y llama a updatePassword. */
export async function updatePasswordForm(
  formData: FormData
): Promise<UpdatePasswordResult> {
  const newPassword = String(formData.get('newPassword') ?? '').trim();
  const confirmPassword = String(formData.get('confirmPassword') ?? '').trim();

  if (!newPassword) return { error: 'Escribe la nueva contraseña.' };
  if (newPassword.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  if (newPassword !== confirmPassword) return { error: 'Las contraseñas no coinciden.' };

  return updatePassword(newPassword);
}
