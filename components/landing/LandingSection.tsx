import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const LANDING_SECTION_INNER =
  'container mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6';
export const LANDING_SECTION_Y = 'py-10 sm:py-16 md:py-20';

export function LandingSection({
  id,
  children,
  className,
  innerClassName,
  tone = 'base',
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  tone?: 'base' | 'alt';
}) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-16 border-t border-slate-800/80',
        tone === 'alt' ? 'bg-slate-950' : 'bg-slate-900',
        LANDING_SECTION_Y,
        className
      )}
    >
      <div className={cn(LANDING_SECTION_INNER, innerClassName)}>{children}</div>
    </section>
  );
}

export function SectionEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'mb-2 text-center text-xs font-semibold uppercase tracking-widest text-blue-400 sm:mb-3 sm:text-sm',
        className
      )}
    >
      {children}
    </p>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 px-1 text-center text-2xl font-bold tracking-tight text-white sm:mb-4 sm:text-3xl md:text-4xl">
      {children}
    </h2>
  );
}

export function SectionLead({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto mb-8 max-w-2xl px-1 text-center text-sm text-slate-400 sm:mb-12 sm:text-base md:text-lg">
      {children}
    </p>
  );
}
