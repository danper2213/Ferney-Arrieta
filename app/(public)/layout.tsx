import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PublicChrome } from '@/components/landing/PublicChrome';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let navbarUser: {
    email: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  } | null = null;
  let redirectMaster = false;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', authUser.id)
        .maybeSingle();

      const displayName = (profile as { display_name?: string | null } | null)?.display_name ?? null;
      const role = (profile as { role?: string | null } | null)?.role ?? null;
      const avatarUrl =
        (authUser.user_metadata as { avatar_url?: string } | undefined)?.avatar_url ?? null;

      if (role === 'master') {
        redirectMaster = true;
      } else {
        navbarUser = {
          email: authUser.email ?? '',
          displayName:
            displayName ??
            (authUser.user_metadata as { full_name?: string } | undefined)?.full_name ??
            null,
          avatarUrl,
          role,
        };
      }
    }
  } catch (error) {
    console.error('Public layout auth unavailable:', error);
  }

  if (redirectMaster) {
    redirect('/admin/dashboard');
  }

  return <PublicChrome user={navbarUser}>{children}</PublicChrome>;
}
