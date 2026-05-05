'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { logout } from '@/app/login/actions';
import { LayoutDashboard, LogOut, Menu } from 'lucide-react';

export type NavbarUser = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
};

function MobileNavSheet({ user }: { user: NavbarUser | null }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl border border-border bg-muted/40 text-foreground hover:bg-muted md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" strokeWidth={2.25} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(100%,20rem)] sm:max-w-sm">
        <SheetHeader className="text-left">
          <SheetTitle>Menú</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-3 px-2 pb-6">
          {isHome && (
            <SheetClose asChild>
              <Link
                href="/#programas"
                className="flex w-full items-center justify-center rounded-lg border border-border bg-muted/40 px-4 py-3 text-center text-sm font-medium hover:bg-muted"
              >
                Programas destacados
              </Link>
            </SheetClose>
          )}
          {user ? (
            <>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                <p className="truncate font-medium">{user.displayName ?? 'Usuario'}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <SheetClose asChild>
                <Link
                  href={user.role === 'master' ? '/admin/dashboard' : '/dashboard'}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-muted"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {user.role === 'master' ? 'Panel de control' : 'Mi panel'}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <form action={logout} className="w-full">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </form>
              </SheetClose>
            </>
          ) : (
            <SheetClose asChild>
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Iniciar sesión
              </Link>
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function Navbar({ user }: { user: NavbarUser | null }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container relative flex h-[4.75rem] w-full items-center px-4 sm:h-[5.25rem] sm:px-6">
        <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2 sm:left-6 md:hidden">
          <MobileNavSheet user={user} />
        </div>

        <div className="flex flex-1" aria-hidden="true" />
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center font-semibold text-foreground transition-opacity hover:opacity-90"
          aria-label="Comunidad de Acordeoneros - Inicio"
        >
          <Image
            src="/logo.png"
            alt="Comunidad de Acordeoneros"
            width={300}
            height={78}
            className="h-12 w-auto max-w-[min(82vw,300px)] object-contain sm:h-[3.25rem] sm:max-w-[min(78vw,320px)] md:h-14 md:max-w-[380px]"
            priority
          />
        </Link>

        <nav className="relative z-20 hidden flex-1 items-center justify-end gap-2 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full text-foreground hover:bg-accent hover:text-accent-foreground sm:h-11 sm:w-11"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-border sm:h-10 sm:w-10">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {(user.displayName ?? user.email ?? 'U').slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border bg-popover text-popover-foreground">
                <div className="flex flex-col gap-1 px-2 py-1.5 text-sm">
                  <p className="truncate font-medium text-foreground">{user.displayName ?? 'Usuario'}</p>
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
                      className="flex w-full cursor-pointer items-center gap-2 bg-transparent text-left text-sm text-muted-foreground hover:text-foreground focus:bg-accent focus:text-foreground"
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
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Iniciar Sesión
            </Link>
          )}
        </nav>

        {/* Equilibra el logo centrado en móvil (misma anchura que el botón menú) */}
        <div className="w-11 shrink-0 md:hidden" aria-hidden />
      </div>
    </header>
  );
}
