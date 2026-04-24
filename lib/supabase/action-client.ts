import { createServerClient } from '@supabase/ssr';
import type { cookies } from 'next/headers';

export type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function createSupabaseForAction(
  supabaseUrl: string,
  supabaseKey: string,
  cookieStore: CookieStore,
) {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set({ name, value, ...options });
        });
      },
    },
  });
}
