import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type SiteFooterProps = {
  user?: { email?: string | null } | null;
  className?: string;
};

const NAV_LINKS = [
  { href: '/#conseguir', label: 'El programa' },
  { href: '/#elige', label: 'Planes' },
  { href: '/#faq', label: 'Preguntas' },
  { href: '/#testimonios', label: 'Testimonios' },
  { href: '/login', label: 'Iniciar sesión' },
  { href: '/register', label: 'Registrarse' },
] as const;

const SOCIAL_LINKS = [
  { href: '#', label: 'Facebook', Icon: Facebook },
  { href: '#', label: 'Instagram', Icon: Instagram },
  { href: '#', label: 'YouTube', Icon: Youtube },
] as const;

export function SiteFooter({ user, className }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn('relative overflow-hidden border-t border-white/10', className)}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.16),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(15,23,42,0.95),_#09090b)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-3 py-10 sm:px-4 sm:py-16 md:px-6 md:py-20">
        <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-2xl sm:p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
            <div className="min-w-0">
              <Link href="/" className="mb-5 inline-flex max-w-full transition-opacity hover:opacity-90 sm:mb-6">
                <Image
                  src="/logo.png"
                  alt="Comunidad de Acordeoneros"
                  width={220}
                  height={56}
                  className="h-9 w-auto max-w-full object-contain sm:h-11"
                />
              </Link>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400 sm:text-xs">
                Comunidad de Acordeoneros
              </p>
              <h2 className="max-w-md text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                Domina el acordeón.
                <span className="mt-1 block text-slate-300">Domina tu vida.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:mt-4 sm:text-base">
                Programas estructurados, mentoría real y una comunidad para que tu progreso no
                dependa de la suerte.
              </p>

              <div className="mt-5 flex w-full flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
                <Link
                  href="/#elige"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 sm:min-h-0"
                >
                  Quiero aprender acordeón
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                </Link>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white sm:min-h-0"
                  >
                    Ir al dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white sm:min-h-0"
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="min-w-0">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Navegación
                </h3>
                <ul className="space-y-2.5">
                  {NAV_LINKS.filter((link) => {
                    if (!user) return true;
                    return link.href !== '/login' && link.href !== '/register';
                  }).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-10 items-center text-sm text-slate-400 transition-colors hover:text-white sm:min-h-0"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {user && (
                    <li>
                      <Link
                        href="/dashboard"
                        className="inline-flex min-h-10 items-center text-sm text-slate-400 transition-colors hover:text-white sm:min-h-0"
                      >
                        Dashboard
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              <div className="min-w-0">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Síguenos
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300 sm:h-10 sm:w-10"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  Contenido, avances y comunidad en redes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 sm:mt-10 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500 sm:text-sm">
              © {year} Comunidad de Acordeoneros. Todos los derechos reservados.
            </p>
            <p className="text-xs text-slate-600">Hecho para músicos que practican con intención.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
