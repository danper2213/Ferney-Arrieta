import { createClient } from '@/lib/supabase/server';
import { StudentNavbar } from '@/components/layout/StudentNavbar';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let navbarUser: { displayName: string | null; email: string; avatarUrl: string | null } | null = null;

  if (authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', authUser.id)
      .maybeSingle();

    const displayName = (profile as { display_name?: string | null } | null)?.display_name ?? null;
    const avatarUrl = (authUser.user_metadata as { avatar_url?: string } | undefined)?.avatar_url ?? null;

    navbarUser = {
      displayName: displayName ?? (authUser.user_metadata as { full_name?: string } | undefined)?.full_name ?? null,
      email: authUser.email ?? '',
      avatarUrl,
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar user={navbarUser} />
      {children}
    </div>
  );
}
