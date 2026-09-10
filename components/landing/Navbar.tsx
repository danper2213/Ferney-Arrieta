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
import { cn } from '@/lib/utils';
import { LayoutDashboard, LogOut, Menu } from 'lucide-react';

export type NavbarUser = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
};

function MobileNavSheet({
  user,
  overHero,
}: {
  user: NavbarUser | null;
  overHero: boolean;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-11 w-11 shrink-0 rounded-xl md:hidden',
            overHero
              ? 'border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white'
              : 'border border-border bg-muted/40 text-foreground hover:bg-muted',
          )}
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
            <>
              <SheetClose asChild>
                <Link
                  href="/#conseguir"
                  className="flex w-full items-center justify-center rounded-lg border border-border bg-muted/40 px-4 py-3 text-center text-sm font-medium hover:bg-muted"
                >
                  El programa
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/#elige"
                  className="flex w-full items-center justify-center rounded-lg border border-border bg-muted/40 px-4 py-3 text-center text-sm font-medium hover:bg-muted"
                >
                  Planes
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/#faq"
                  className="flex w-full items-center justify-center rounded-lg border border-border bg-muted/40 px-4 py-3 text-center text-sm font-medium hover:bg-muted"
                >
                  Preguntas
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/#testimonios"
                  className="flex w-full items-center justify-center rounded-lg border border-border bg-muted/40 px-4 py-3 text-center text-sm font-medium hover:bg-muted"
                >
                  Testimonios
                </Link>
              </SheetClose>
            </>
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
                className="flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-3.5 text-base font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:bg-blue-500"
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
  const pathname = usePathname();
  const overHero = pathname === '/';

  return (
    <header
      className={cn(
        'z-50 w-full transition-colors duration-300',
        overHero
          ? 'absolute top-0 left-0 right-0 border-b border-transparent bg-gradient-to-b from-black/55 via-black/20 to-transparent'
          : 'relative border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
      )}
    >
      <div
        className={cn(
          'container grid w-full max-w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-3 sm:grid-cols-3 sm:px-6',
          overHero ? 'h-14 sm:h-16' : 'h-[5.5rem] sm:h-[6.25rem] md:h-[6.75rem]',
        )}
      >
        <div className="flex items-center justify-start">
          <div className="md:hidden">
            <MobileNavSheet user={user} overHero={overHero} />
          </div>
        </div>

        {overHero ? (
          <nav className="hidden items-center justify-center gap-3 justify-self-center text-xs font-medium text-white/80 md:flex lg:gap-5 lg:text-sm">
            <Link href="/#conseguir" className="transition-colors hover:text-white">
              El programa
            </Link>
            <Link href="/#elige" className="transition-colors hover:text-white">
              Planes
            </Link>
            <Link href="/#faq" className="transition-colors hover:text-white">
              Preguntas
            </Link>
            <Link href="/#testimonios" className="transition-colors hover:text-white">
              Testimonios
            </Link>
          </nav>
        ) : (
          <Link
            href="/"
            className="flex items-center justify-center justify-self-center transition-opacity hover:opacity-90"
            aria-label="Comunidad de Acordeoneros - Inicio"
          >
            <Image
              src="/logo.png"
              alt="Comunidad de Acordeoneros"
              width={420}
              height={110}
              className="h-14 w-auto max-w-[min(82vw,320px)] object-contain sm:h-16 sm:max-w-[min(78vw,360px)] md:h-[4.25rem] md:max-w-[420px]"
              priority
            />
          </Link>
        )}

        <nav className="flex items-center justify-end gap-2">
          <div className="hidden md:contents">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'relative h-11 w-11 rounded-full sm:h-12 sm:w-12',
                      overHero
                        ? 'text-white hover:bg-white/15 hover:text-white'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-white/30 sm:h-11 sm:w-11">
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
            ) : overHero ? null : (
              <Link
                href="/login"
                className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold tracking-wide text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all duration-300 hover:bg-blue-500"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
