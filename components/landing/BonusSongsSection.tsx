import Image from 'next/image';
import { Gift, Music2 } from 'lucide-react';
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
    <article
      className={cn(
        'w-full max-w-full overflow-hidden rounded-xl border border-amber-500/25 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:rounded-2xl',
        className
      )}
    >
      <div className="grid md:grid-cols-2">
        <div className="flex flex-col justify-center gap-3.5 p-4 sm:gap-5 sm:p-8 md:order-1 md:p-10 lg:p-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-200">
              <Gift className="h-3.5 w-3.5 shrink-0" />
              Bono al culminar
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
              <span className="min-w-0">Acceso bonus al completar Domina el Acordeón</span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                <Music2 className="h-3 w-3" />
              </span>
              <span className="min-w-0">Canciones para practicar y consolidar tu técnica</span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                <Music2 className="h-3 w-3" />
              </span>
              <span className="min-w-0">Incluido en todos los planes de Domina</span>
            </li>
          </ul>
        </div>

        <div className="relative aspect-[16/10] min-h-[200px] overflow-hidden bg-slate-800 sm:aspect-[16/9] sm:min-h-[260px] md:order-2 md:aspect-auto md:min-h-[320px]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:to-slate-950/30" />
        </div>
      </div>
    </article>
  );
}
