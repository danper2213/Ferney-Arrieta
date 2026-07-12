'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentModal } from '@/components/landing/PaymentModal';
import { BookOpen, ChevronRight, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeaturedCourseCardProps = {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string | null;
    payment_link: string | null;
    programContent: string;
  };
  isEnrolled: boolean;
  userEmail: string | null;
  whatsappNumber: string;
  whatsappUrl: string;
  accentBg: string;
  /** Alterna imagen a la derecha en desktop */
  imageOnRight?: boolean;
};

export function FeaturedCourseCard({
  course,
  isEnrolled,
  userEmail,
  whatsappNumber,
  whatsappUrl,
  accentBg,
  imageOnRight = false,
}: FeaturedCourseCardProps) {
  const [learnOpen, setLearnOpen] = useState(false);
  const hasProgramContent = Boolean(course.programContent);

  const purchaseAction = isEnrolled ? (
    <Link
      href={`/course/${course.slug}`}
      className={cn(
        'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors sm:w-auto sm:min-h-0 sm:text-base',
        accentBg
      )}
    >
      Ir al Aula
      <span aria-hidden>▶️</span>
    </Link>
  ) : course.payment_link?.trim() ? (
    <PaymentModal
      courseTitle={course.title}
      paymentLink={course.payment_link}
      userEmail={userEmail}
      whatsappNumber={whatsappNumber || null}
      triggerClassName="min-h-11 w-full rounded-full px-6 py-3 text-sm sm:min-h-0 sm:w-auto sm:text-base"
    />
  ) : (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#20BD5A] sm:min-h-0 sm:w-auto sm:text-base"
    >
      <MessageCircle className="h-4 w-4 shrink-0" />
      Comprar por WhatsApp
    </a>
  );

  const imageBlock = (
    <div
      className={cn(
        'relative aspect-[16/10] min-h-[200px] w-full overflow-hidden bg-slate-800 sm:aspect-[16/9] sm:min-h-[260px] md:aspect-auto md:min-h-full md:self-stretch',
        imageOnRight ? 'md:order-2' : 'md:order-1'
      )}
    >
      {course.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full min-h-[200px] w-full items-center justify-center sm:min-h-[260px]">
          <BookOpen className="h-12 w-12 text-slate-600 sm:h-14 sm:w-14" />
        </div>
      )}
    </div>
  );

  const textBlock = (
    <div
      className={cn(
        'flex flex-col justify-center gap-3.5 p-4 sm:gap-5 sm:p-8 md:p-10 lg:p-12',
        imageOnRight ? 'md:order-1' : 'md:order-2'
      )}
    >
      <div className="space-y-3 sm:space-y-4">
        <h3 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          {course.title}
        </h3>
        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
          {course.description}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {hasProgramContent && (
          <button
            type="button"
            onClick={() => setLearnOpen(true)}
            className={cn(
              'learn-cta-button group relative inline-flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-full border border-blue-500/40 sm:w-auto',
              'bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 px-5 py-3 text-left',
              'transition-all duration-300 hover:border-blue-400/70',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60'
            )}
          >
            <span
              aria-hidden
              className="learn-cta-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/15 to-transparent"
            />
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="relative min-w-0">
              <span className="block text-sm font-semibold text-white">¿Qué aprenderás?</span>
              <span className="block text-xs text-blue-200/80">Ver contenido del programa</span>
            </span>
            <ChevronRight className="relative ml-auto h-4 w-4 shrink-0 text-blue-400 transition-transform group-hover:translate-x-0.5 sm:ml-0" />
          </button>
        )}
        {purchaseAction}
      </div>
    </div>
  );

  return (
    <>
      <article className="grid w-full max-w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:rounded-2xl md:grid-cols-2 md:min-h-[340px] lg:min-h-[400px]">
        {imageBlock}
        {textBlock}
      </article>

      <Dialog open={learnOpen} onOpenChange={setLearnOpen}>
        <DialogContent
          className={cn(
            'z-[100] flex w-[calc(100%-1rem)] max-w-[min(100%-1rem,36rem)] flex-col gap-0 overflow-hidden',
            'max-h-[min(88dvh,640px)] border-slate-800 bg-slate-950 p-0 text-white',
            'sm:w-[calc(100%-2rem)] sm:max-w-xl'
          )}
        >
          <DialogHeader className="shrink-0 space-y-1 border-b border-slate-800 px-4 py-3 pr-12 text-left sm:px-5 sm:py-4">
            <DialogTitle className="text-base font-semibold text-white sm:text-lg">
              ¿Qué aprenderás?
            </DialogTitle>
            <DialogDescription className="line-clamp-2 text-xs text-slate-400 sm:text-sm">
              {course.title}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300 sm:text-[0.9375rem]">
              {course.programContent}
            </p>
          </div>

          <div className="flex shrink-0 justify-center border-t border-slate-800 bg-slate-950 px-4 py-3 sm:px-5 sm:py-4">
            {purchaseAction}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
