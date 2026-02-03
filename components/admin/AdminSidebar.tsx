'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/login/actions';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Cursos', icon: BookOpen },
  { href: '/admin/students', label: 'Estudiantes', icon: Users },
] as const;

export function AdminSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

  const linkClass = (href: string) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive(href)
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    );

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="mb-2 px-3">
        <span className="font-semibold text-foreground">
          Administración
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={linkClass(href)}
            onClick={onNavigate}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        ))}
        <div className="my-2 border-t border-border" />
        <form action={logout} className="block">
          <button
            type="submit"
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={onNavigate}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Salir / Cerrar sesión
          </button>
        </form>
      </nav>
    </div>
  );
}
