import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function isDeadSessionAuthError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; message?: string };
  const code = e.code ?? '';
  const msg = (typeof e.message === 'string' ? e.message : '').toLowerCase();
  return (
    code === 'refresh_token_not_found' ||
    code === 'invalid_grant' ||
    code === 'session_not_found' ||
    msg.includes('refresh token not found') ||
    msg.includes('invalid refresh token')
  );
}

/**
 * Refreshes the Supabase session on each request and syncs auth cookies.
 * Without this, expired access tokens and refresh flows are handled poorly in RSC.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const { error } = await supabase.auth.getUser();
    if (error && isDeadSessionAuthError(error)) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    if (isDeadSessionAuthError(err)) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore: cookies may already be cleared or session absent
      }
    } else {
      throw err;
    }
  }

  return supabaseResponse;
}
