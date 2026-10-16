/**
 * Variables públicas de Supabase (URL + anon/publishable key).
 * Usar esto para degradar con elegancia cuando el entorno aún no tiene secretos.
 */
export type SupabasePublicEnv = {
  url: string;
  key: string;
};

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '').trim();
  if (!url || !key) return null;
  return { url, key };
}

export function hasSupabasePublicEnv(): boolean {
  return getSupabasePublicEnv() != null;
}

export const MISSING_SUPABASE_ENV_MESSAGE =
  'Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY';
