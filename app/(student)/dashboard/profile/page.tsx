import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from './ProfileForm';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?error=Inicia sesión para ver tu perfil');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const displayName =
    (profile as { display_name?: string | null } | null)?.display_name ??
    (user.user_metadata?.full_name as string) ??
    '';
  const avatarUrl =
    (profile as { avatar_url?: string | null } | null)?.avatar_url ??
    (user.user_metadata?.avatar_url as string) ??
    null;
  const email = user.email ?? '';

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 sm:py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Mi Perfil
          </h1>
          <p className="text-slate-400 mt-1">
            Actualiza tu información y contraseña
          </p>
        </div>

        <ProfileForm
          displayName={displayName}
          email={email}
          avatarUrl={avatarUrl}
        />
      </div>
    </div>
  );
}
