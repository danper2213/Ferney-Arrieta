'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseForAction } from '@/lib/supabase/action-client';
import {
  getSupabasePublicEnv,
  MISSING_SUPABASE_ENV_MESSAGE,
} from '@/lib/supabase/env';

export type LoginState = {
  error?: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState | void> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return {
      error: 'Email y contraseña son obligatorios.',
    };
  }

  const env = getSupabasePublicEnv();

  if (!env) {
    console.error(MISSING_SUPABASE_ENV_MESSAGE);

    return {
      error:
        'Error de configuración del servidor. Por favor, contacta al administrador.',
    };
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseForAction(env.url, env.key, cookieStore);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    console.error('Error al iniciar sesión', error);

    return {
      error: 'Credenciales inválidas. Revisa tu email y contraseña.',
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.error('No se pudo obtener el perfil del usuario', profileError);

    return {
      error:
        'No se pudo obtener la información de tu perfil. Intenta de nuevo más tarde.',
    };
  }

  const role = profile.role as 'master' | 'student' | null;

  if (role === 'master') {
    redirect('/admin/dashboard');
  }

  if (role === 'student') {
    redirect('/dashboard');
  }

  // Fallback en caso de que el rol no sea el esperado
  redirect('/');
}

export async function logout() {
  const env = getSupabasePublicEnv();

  if (!env) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseForAction(env.url, env.key, cookieStore);

  await supabase.auth.signOut();
  redirect('/');
}
