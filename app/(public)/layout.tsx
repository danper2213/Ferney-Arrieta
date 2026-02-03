import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let navbarUser: { email: string; displayName?: string | null; avatarUrl?: string | null; role?: string | null } | null = null;

  if (authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, role')
      .eq('id', authUser.id)
      .maybeSingle();

    const displayName = (profile as { display_name?: string | null } | null)?.display_name ?? null;
    const role = (profile as { role?: string | null } | null)?.role ?? null;
    const avatarUrl = (authUser.user_metadata as { avatar_url?: string } | undefined)?.avatar_url ?? null;

    if (role === 'master') {
      redirect('/admin/dashboard');
    }

    navbarUser = {
      email: authUser.email ?? '',
      displayName: displayName ?? (authUser.user_metadata as { full_name?: string } | undefined)?.full_name ?? null,
      avatarUrl,
      role,
    };
  }

  return (
    <>
      <Navbar user={navbarUser} />
      <main>{children}</main>
    </>
  );
}
