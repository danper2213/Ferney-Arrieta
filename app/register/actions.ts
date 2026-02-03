'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type RegisterState = {
  error?: string;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState | void> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const displayName = String(formData.get('display_name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();

  if (!email || !password || !confirmPassword || !displayName || !phone) {
    return {
      error: 'Todos los campos son obligatorios.',
    };
  }

  if (password !== confirmPassword) {
    return {
      error: 'Las contraseñas no coinciden.',
    };
  }

  if (password.length < 6) {
    return {
      error: 'La contraseña debe tener al menos 6 caracteres.',
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

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError || !signUpData?.user) {
    console.error('Error al registrar usuario', signUpError);

    // Límite de envío de emails (común en desarrollo)
    if (signUpError?.code === 'over_email_send_rate_limit') {
      return {
        error:
          'Se superó el límite de envío de correos. Espera unos minutos o desactiva la confirmación por email en el proyecto Supabase (Auth → Providers → Email).',
      };
    }

    return {
      error:
        signUpError?.message ||
        'Error al crear la cuenta. Por favor, intenta de nuevo.',
    };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: signUpData.user.id,
        role: 'student',
        display_name: displayName,
        phone,
      },
      { onConflict: 'id' },
    );

  if (profileError) {
    console.error('Error al crear el perfil', profileError);

    return {
      error: 'Error al crear tu perfil. Por favor, contacta al administrador.',
    };
  }

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError || !signInData?.user) {
    console.error('Error al iniciar sesión después del registro', signInError);

    return {
      error:
        'Cuenta creada exitosamente, pero hubo un error al iniciar sesión. Por favor, inicia sesión manualmente.',
    };
  }

  redirect('/dashboard');
}

