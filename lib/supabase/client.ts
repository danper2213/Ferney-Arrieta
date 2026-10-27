import { createBrowserClient } from '@supabase/ssr';
import {
  getSupabasePublicEnv,
  MISSING_SUPABASE_ENV_MESSAGE,
} from '@/lib/supabase/env';

export function createClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error(MISSING_SUPABASE_ENV_MESSAGE);
  }

  return createBrowserClient(env.url, env.key);
}
