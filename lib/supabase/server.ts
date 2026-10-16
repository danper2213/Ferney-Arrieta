import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  getSupabasePublicEnv,
  MISSING_SUPABASE_ENV_MESSAGE,
} from '@/lib/supabase/env';

export async function createClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error(MISSING_SUPABASE_ENV_MESSAGE);
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        } catch {
          // Cookies can only be modified in Server Actions or Route Handlers (Next.js 15+).
          // During Server Component render we skip setting so the page still loads.
        }
      },
    },
  });
}
