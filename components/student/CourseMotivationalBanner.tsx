import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type CourseMotivationalBannerProps = {
  message: string;
  /** @deprecated Usa subtitle */
  courseTitle?: string;
  subtitle?: string;
  className?: string;
};

export function CourseMotivationalBanner({
  message,
  courseTitle,
  subtitle,
  className,
}: CourseMotivationalBannerProps) {
  const text = message.trim();
  if (!text) return null;

  const heading =
    subtitle ??
    (courseTitle ? `Un mensaje para tu camino en ${courseTitle}` : 'Un mensaje para ti');

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-amber-500/25',
        'bg-gradient-to-br from-amber-500/15 via-orange-500/8 to-rose-500/12',
        'px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8 shadow-sm',
        className
      )}
      aria-label="Mensaje motivador"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-rose-400/15 blur-3xl"
        aria-hidden
      />

      <div className="relative flex gap-4">
        <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700/90 dark:text-amber-300/90">
            {heading}
          </p>
          <blockquote className="font-serif italic text-lg md:text-xl lg:text-[1.35rem] leading-relaxed text-foreground/95">
            <span className="text-amber-600/70 dark:text-amber-400/80 text-2xl leading-none align-top mr-1">
              &ldquo;
            </span>
            {text}
            <span className="text-amber-600/70 dark:text-amber-400/80 text-2xl leading-none align-bottom ml-0.5">
              &rdquo;
            </span>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
