'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logout } from '@/app/login/actions';
import { LayoutDashboard, LogOut } from 'lucide-react';

export type NavbarUser = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
};

export function Navbar({ user }: { user: NavbarUser | null }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground hover:opacity-90 transition-opacity"
          aria-label="Comunidad de Acordeoneros - Inicio"
        >
          <Image
            src="/logo.png"
            alt="Comunidad de Acordeoneros"
            width={180}
            height={44}
            className="h-9 w-auto object-contain dark:invert dark:opacity-95"
            priority
          />
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-border">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {(user.displayName ?? user.email ?? 'U').slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground border-border">
                <div className="flex flex-col gap-1 px-2 py-1.5 text-sm">
                  <p className="font-medium truncate text-foreground">{user.displayName ?? 'Usuario'}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link
                    href={user.role === 'master' ? '/admin/dashboard' : '/dashboard'}
                    className="flex cursor-pointer items-center gap-2 focus:bg-accent focus:text-accent-foreground"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {user.role === 'master' ? 'Panel de control' : 'Mi Panel'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <form action={logout} className="flex w-full cursor-pointer items-center gap-2 outline-none">
                    <button
                      type="submit"
                      className="flex w-full cursor-pointer items-center gap-2 bg-transparent text-left text-sm text-muted-foreground hover:text-foreground focus:text-foreground focus:bg-accent"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Cerrar Sesión
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Iniciar Sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
