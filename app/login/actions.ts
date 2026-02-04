'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      'Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    );

    return {
      error:
        'Error de configuración del servidor. Por favor, contacta al administrador.',
    };
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value: '',
          ...options,
          maxAge: 0,
        });
      },
    },
  });

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;  if (!supabaseUrl || !supabaseKey) {
    redirect('/');
  }

  const cookieStore = await cookies();  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value: '',
          ...options,
          maxAge: 0,
        });
      },
    },
  });

  await supabase.auth.signOut();
  redirect('/');
}
