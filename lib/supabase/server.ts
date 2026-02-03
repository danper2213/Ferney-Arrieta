import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value,
            ...options,
          });
        } catch {
          // Cookies can only be modified in Server Actions or Route Handlers (Next.js 15+).
          // During Server Component render we skip setting so the page still loads.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        } catch {
          // Same as set: no-op during RSC render.
        }
      },
    },
  });
}
