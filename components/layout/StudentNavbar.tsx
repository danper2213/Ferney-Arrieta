'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logout } from '@/app/login/actions';
import { Home, LogOut, HeadphonesIcon } from 'lucide-react';

export type StudentNavbarUser = {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
};

type StudentNavbarProps = {
  user: StudentNavbarUser | null;
  /** Opcional: puntos o valor de progreso a mostrar */
  points?: number | null;
};

const LOGO_ALT = 'Comunidad de Acordeoneros';
const SUPPORT_LINK = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? '#';

export function StudentNavbar({ user, points }: StudentNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-opacity"
          aria-label="Ir al Dashboard"
        >
          <Image
            src="/logo.png"
            alt={LOGO_ALT}
            width={140}
            height={36}
            className="h-8 w-auto object-contain dark:invert dark:opacity-95"
            priority
          />
        </Link>

        <nav className="flex items-center gap-3">
          {points != null && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-300">
              <span className="font-medium text-primary">{points}</span>
              <span>Puntos</span>
            </div>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full text-foreground hover:bg-white/10 hover:text-white"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-slate-700">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {(user.displayName ?? user.email ?? 'U').slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-slate-800 bg-slate-900 text-white"
              >
                <div className="flex flex-col gap-1 px-2 py-1.5 text-sm">
                  <p className="font-medium truncate text-white">
                    {user.displayName ?? 'Usuario'}
                  </p>
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/"
                    className="flex cursor-pointer items-center gap-2 text-slate-200 focus:bg-white/10 focus:text-white"
                  >
                    <Home className="h-4 w-4" />
                    Ir al Inicio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={SUPPORT_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex cursor-pointer items-center gap-2 text-slate-200 focus:bg-white/10 focus:text-white"
                  >
                    <HeadphonesIcon className="h-4 w-4" />
                    Soporte
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem asChild>
                  <form action={logout} className="flex w-full cursor-pointer items-center gap-2 outline-none">
                    <button
                      type="submit"
                      className="flex w-full cursor-pointer items-center gap-2 bg-transparent text-left text-sm text-destructive hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
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
              className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
