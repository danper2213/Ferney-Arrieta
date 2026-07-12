'use client';

import { usePathname } from 'next/navigation';
import { Navbar, type NavbarUser } from '@/components/landing/Navbar';

export function PublicChrome({
  user,
  children,
}: {
  user: NavbarUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar = pathname === '/login' || pathname === '/register';

  if (hideNavbar) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar user={user} />
      <main>{children}</main>
    </>
  );
}
