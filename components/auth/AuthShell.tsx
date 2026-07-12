import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(15,23,42,0.9),_#09090b)]"
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

      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-4 py-8 sm:px-6 sm:py-14 lg:py-16">
        <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Brand panel */}
          <div className="hidden min-w-0 flex-col justify-center lg:flex">
            <Link href="/" className="mb-10 inline-flex w-fit max-w-full transition-opacity hover:opacity-90">
              <Image
                src="/logo.png"
                alt="Comunidad de Acordeoneros"
                width={360}
                height={96}
                className="h-16 w-auto max-w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                priority
              />
            </Link>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
              Comunidad de Acordeoneros
            </p>
            <h2 className="max-w-md text-4xl font-bold tracking-tight text-white xl:text-5xl">
              Domina el acordeón.
              <span className="mt-2 block text-slate-300">Domina tu vida.</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">
              Accede a tu programa, mentorías y comunidad desde un solo lugar. Seguridad y
              continuidad para tu aprendizaje.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Plataforma estructurada paso a paso
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Mentorías y acompañamiento real
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Acceso seguro a tu contenido
              </li>
            </ul>
          </div>

          {/* Form panel */}
          <div className={cn('mx-auto w-full max-w-md min-w-0 lg:mx-0 lg:justify-self-end', className)}>
            <div className="mb-6 flex flex-col items-center text-center sm:mb-8 lg:hidden">
              <Link href="/" className="mb-5 max-w-full transition-opacity hover:opacity-90">
                <Image
                  src="/logo.png"
                  alt="Comunidad de Acordeoneros"
                  width={280}
                  height={74}
                  className="h-11 w-auto max-w-[min(80vw,280px)] object-contain sm:h-14"
                  priority
                />
              </Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-2xl sm:p-8">
              <div className="mb-5 space-y-2 text-center sm:mb-8 sm:text-left">
                <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl sm:text-[1.75rem]">
                  {title}
                </h1>
                <p className="text-sm leading-relaxed text-slate-400">{description}</p>
              </div>

              {children}

              <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
                {footer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
