'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type UpdateSettingResult = {
  success: boolean;
  error?: string;
};

export async function updateSetting(
  key: string,
  newValue: string
): Promise<UpdateSettingResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autorizado. Inicia sesión.' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return { success: false, error: 'No se pudo verificar tu rol.' };
    }

    const role = (profile as { role?: string }).role;
    if (role !== 'master') {
      return { success: false, error: 'Solo el administrador (master) puede modificar la configuración.' };
    }

    const { error: updateError } = await supabase
      .from('app_settings')
      .update({ value: newValue })
      .eq('key', key);

    if (updateError) {
      console.error('Error al actualizar configuración:', updateError);
      const err = updateError as { message?: string; details?: string };
      return {
        success: false,
        error: err?.message || err?.details || 'Error al guardar la configuración.',
      };
    }

    revalidatePath('/admin/settings');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error inesperado en updateSetting:', error);
    return { success: false, error: 'Error inesperado al guardar la configuración.' };
  }
}

export type SaveSettingsResult = {
  success: boolean;
  error?: string;
};

/** Guarda múltiples configuraciones desde FormData. Keys deben venir en formData.get('_keys') como "key1,key2". */
export async function saveSettings(formData: FormData): Promise<SaveSettingsResult> {
  const keysStr = formData.get('_keys');
  if (typeof keysStr !== 'string' || !keysStr.trim()) {
    return { success: false, error: 'No se recibieron claves de configuración.' };
  }
  const keys = keysStr.split(',').map((k) => k.trim()).filter(Boolean);
  for (const key of keys) {
    const value = formData.get(key);
    const result = await updateSetting(key, value != null ? String(value) : '');
    if ('error' in result && result.error) return { success: false, error: result.error };
  }
  return { success: true };
}
