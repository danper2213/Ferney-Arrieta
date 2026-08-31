import Image from 'next/image';
import { Gift, LockOpen, Music2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type BonusSongsSectionProps = {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  className?: string;
};

export function BonusSongsSection({
  title = 'Programa de Canciones',
  description = 'Un repertorio pensado para aplicar lo que aprendes en Domina el Acordeón. No se compra por separado: lo desbloqueas automáticamente al culminar el programa base.',
  imageUrl = null,
  className,
}: BonusSongsSectionProps) {
  return (
    <aside className={cn('w-full max-w-full', className)}>
      <div className="mb-6 flex flex-col items-center gap-3 text-center sm:mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-amber-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200 sm:text-xs">
          <Plus className="h-3.5 w-3.5 shrink-0" />
          Programa adicional
        </span>
        <p className="max-w-xl px-2 text-sm leading-relaxed text-slate-400">
          Además de los programas principales, incluimos este contenido extra.{' '}
          <span className="text-slate-300">No se vende por separado:</span> lo desbloqueas al
          culminar tu formación.
        </p>
      </div>

      <article className="relative overflow-hidden rounded-xl border border-dashed border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:rounded-2xl">
        <div className="pointer-events-none absolute right-4 top-4 z-10 hidden rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200 sm:block">
          Incluido · No se compra aparte
        </div>

        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-center gap-3.5 p-4 sm:gap-5 sm:p-8 md:order-1 md:p-10 lg:p-12">
            <div className="flex flex-wrap items-center gap-2 sm:hidden">
              <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                Incluido · No se compra aparte
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-200">
                <Gift className="h-3.5 w-3.5 shrink-0" />
                Bonus al culminar
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/60 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-400">
                <LockOpen className="h-3 w-3 shrink-0" />
                Se activa al terminar
              </span>
            </div>

            <h3 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              {title}
            </h3>

            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              {description}
            </p>

            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                  <Music2 className="h-3 w-3" />
                </span>
                <span className="min-w-0">Programa extra para reforzar lo aprendido</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                  <Music2 className="h-3 w-3" />
                </span>
                <span className="min-w-0">Repertorio de canciones para practicar en casa</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                  <Music2 className="h-3 w-3" />
                </span>
                <span className="min-w-0">Incluido en todos los planes de Domina el Acordeón</span>
              </li>
            </ul>
          </div>

          <div className="relative aspect-[16/10] min-h-[200px] overflow-hidden bg-slate-800 sm:aspect-[16/9] sm:min-h-[260px] md:order-2 md:aspect-auto md:min-h-[320px]">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950">
                <Image
                  src="/images/accordion-full.png"
                  alt=""
                  fill
                  className="object-contain object-center p-6 opacity-80 grayscale-[30%] sm:p-8"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:to-slate-950/40" />
          </div>
        </div>
      </article>
    </aside>
  );
}
