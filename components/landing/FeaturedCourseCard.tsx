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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  accentBorder: string;
};

export function FeaturedCourseCard({
  course,
  isEnrolled,
  userEmail,
  whatsappNumber,
  whatsappUrl,
  accentBg,
  accentBorder,
}: FeaturedCourseCardProps) {
  const [learnOpen, setLearnOpen] = useState(false);
  const hasProgramContent = Boolean(course.programContent);

  const purchaseAction = isEnrolled ? (
    <Link
      href={`/course/${course.slug}`}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors sm:py-2.5',
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
      triggerClassName="px-3 py-2 text-sm sm:py-2.5"
    />
  ) : (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#20BD5A] sm:py-2.5"
    >
      <MessageCircle className="h-4 w-4 shrink-0" />
      Comprar por WhatsApp
    </a>
  );

  return (
    <>
      <Card
        className={cn(
          'flex w-full flex-col overflow-hidden border-slate-700/50 bg-slate-950 transition-all hover:border-blue-500/40',
          accentBorder
        )}
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-800 sm:aspect-[5/3]">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-slate-600 sm:h-12 sm:w-12" />
            </div>
          )}
        </div>

        <CardHeader className="space-y-1 p-3 pb-2 sm:p-4 sm:pb-2">
          <CardTitle className="line-clamp-2 text-base font-semibold leading-snug text-white sm:text-lg">
            {course.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-3 pt-0 sm:gap-3 sm:p-4 sm:pt-0">
          <div
            className={cn(
              'min-h-[4.5rem] max-h-28 flex-1 overflow-y-auto overscroll-contain sm:max-h-32',
              'rounded-md border border-slate-800/60 bg-slate-900/40 px-2.5 py-2',
              '[scrollbar-width:thin] [scrollbar-color:rgba(100,116,139,0.45)_transparent]',
              '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600/70'
            )}
          >
            <p className="whitespace-pre-line text-xs leading-relaxed text-slate-400 sm:text-sm">
              {course.description}
            </p>
          </div>

          <div className="mt-auto space-y-2">
            {hasProgramContent && (
              <button
                type="button"
                onClick={() => setLearnOpen(true)}
                className={cn(
                  'learn-cta-button group relative w-full overflow-hidden rounded-lg border border-blue-500/40',
                  'bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 px-3 py-2.5 text-left',
                  'transition-all duration-300 hover:border-blue-400/70 hover:from-blue-900/50 hover:to-indigo-900/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60'
                )}
              >
                <span
                  aria-hidden
                  className="learn-cta-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/15 to-transparent"
                />
                <span className="relative flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 transition-transform duration-300 group-hover:scale-110">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">
                      ¿Qué aprenderás?
                    </span>
                    <span className="block text-xs text-blue-200/80 transition-colors group-hover:text-blue-100">
                      Descubre todo lo que incluye este programa
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-blue-400 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            )}

            {purchaseAction}
          </div>
        </CardContent>
      </Card>

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

          <div className="shrink-0 border-t border-slate-800 bg-slate-950 px-4 py-3 sm:px-5 sm:py-4">
            {purchaseAction}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
