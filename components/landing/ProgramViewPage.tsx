'use client';

import Link from 'next/link';
import { PaymentModal } from '@/components/landing/PaymentModal';
import type { CoursePlan } from '@/lib/course-plans';
import {
  BookOpen,
  Calendar,
  Check,
  Crown,
  Gift,
  MessageCircle,
  Music2,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProgramViewPageProps = {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string | null;
    payment_link: string | null;
    programContent: string;
  };
  plans: CoursePlan[];
  isEnrolled: boolean;
  userEmail: string | null;
  whatsappNumber: string;
};

function buildWhatsAppUrl(label: string, whatsappNumber: string): string {
  const num = (whatsappNumber || '').replace(/\D/g, '');
  if (!num) return '#';
  const message = `Hola, estoy interesado en ${label} que vi en la web. ¿Me podrías enviar el link de pago de Bold?`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

function PlanIcon({ planKey }: { planKey: string }) {
  if (planKey === 'vip_plus') return <Crown className="h-5 w-5" />;
  if (planKey === 'ganador') return <Users className="h-5 w-5" />;
  if (planKey === 'anual') return <Calendar className="h-5 w-5" />;
  return <Zap className="h-5 w-5" />;
}

function PurchaseButton({
  label,
  paymentLink,
  whatsappUrl,
  userEmail,
  whatsappNumber,
  isEnrolled,
  courseSlug,
}: {
  label: string;
  paymentLink: string | null;
  whatsappUrl: string;
  userEmail: string | null;
  whatsappNumber: string;
  isEnrolled: boolean;
  courseSlug: string;
}) {
  if (isEnrolled) {
    return (
      <Link
        href={`/course/${courseSlug}`}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:bg-blue-500 sm:hover:scale-[1.02]"
      >
        Ir al Aula
      </Link>
    );
  }

  if (paymentLink?.trim()) {
    return (
      <PaymentModal
        courseTitle={label}
        paymentLink={paymentLink}
        userEmail={userEmail}
        whatsappNumber={whatsappNumber || null}
        triggerClassName="min-h-11 w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold transition-transform hover:bg-blue-500 sm:hover:scale-[1.02]"
      />
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-transform hover:bg-[#20BD5A] sm:hover:scale-[1.02]"
    >
      <MessageCircle className="h-4 w-4 shrink-0" />
      Quiero este plan
    </a>
  );
}

export function ProgramViewPage({
  course,
  plans,
  isEnrolled,
  userEmail,
  whatsappNumber,
}: ProgramViewPageProps) {
  const activePlans = plans.filter((p) => p.is_active);

  return (
    <article className="program-view w-full max-w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 shadow-[0_24px_60px_rgba(0,0,0,0.4)] sm:rounded-2xl">
      <div className="program-view-hero grid md:grid-cols-2">
        <div className="program-view-image relative aspect-[16/10] min-h-[200px] overflow-hidden bg-slate-800 sm:aspect-[16/9] sm:min-h-[280px] md:aspect-auto md:min-h-[360px] lg:min-h-[400px]">
          {course.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center sm:min-h-[280px]">
              <BookOpen className="h-12 w-12 text-slate-600 sm:h-16 sm:w-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-950/40" />
        </div>

        <div className="program-view-copy flex flex-col justify-center gap-3.5 p-4 sm:gap-5 sm:p-8 md:p-10 lg:p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400 sm:text-xs">
            La raíz de todo
          </p>
          <h3 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {course.title}
          </h3>
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
            {course.description}
          </p>

          {/* Bono canciones */}
          <div className="mt-1 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-blue-500/10 p-3.5 sm:p-5">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 sm:h-10 sm:w-10">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-amber-200">Bono al culminar</p>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                    Incluido
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  Al completar <span className="font-medium text-white">Domina el Acordeón</span>{' '}
                  desbloqueas el{' '}
                  <span className="inline-flex flex-wrap items-center gap-1 font-medium text-white">
                    <Music2 className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                    Programa de Canciones
                  </span>{' '}
                  como acceso bonus. No se compra aparte: lo ganas al terminar.
                </p>
              </div>
            </div>
          </div>

          {isEnrolled && (
            <Link
              href={`/course/${course.slug}`}
              className="mt-1 inline-flex w-full min-h-11 items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:bg-blue-500 sm:w-fit sm:min-h-0 sm:hover:scale-[1.02]"
            >
              Ir al Aula
            </Link>
          )}
        </div>
      </div>

      {activePlans.length > 0 && (
        <div className="border-t border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 px-3 py-8 sm:px-8 sm:py-12 md:px-10 lg:px-12">
          <div className="program-view-plans-title mx-auto mb-6 max-w-2xl px-1 text-center sm:mb-10">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400 sm:text-xs">
              Elige tu acceso
            </p>
            <h4 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Planes para entrar a Domina el Acordeón
            </h4>
            <p className="mt-2 text-sm text-slate-400 sm:mt-3 sm:text-base">
              Desde acceso anual hasta mentorías VIP. Todos incluyen el camino completo y el bono
              del Programa de Canciones al culminar.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {activePlans.map((plan, index) => (
              <div
                key={plan.id || plan.plan_key}
                className={cn(
                  'program-plan-card relative flex flex-col rounded-xl border p-4 transition-all duration-300 sm:rounded-2xl sm:p-6',
                  plan.is_highlighted
                    ? 'border-blue-500/60 bg-blue-950/30 shadow-[0_0_40px_rgba(37,99,235,0.22)] xl:-translate-y-1'
                    : 'border-slate-700/70 bg-slate-950/80 hover:border-blue-500/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:hover:-translate-y-1'
                )}
                style={{ animationDelay: `${0.12 + index * 0.08}s` }}
              >
                {plan.badge && (
                  <span
                    className={cn(
                      'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                      plan.is_highlighted
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-200'
                    )}
                  >
                    {plan.badge}
                  </span>
                )}

                <div className="mb-4 flex items-center gap-3 pt-2">
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      plan.is_highlighted
                        ? 'bg-blue-500/25 text-blue-300'
                        : 'bg-slate-800 text-slate-300'
                    )}
                  >
                    <PlanIcon planKey={plan.plan_key} />
                  </span>
                  <div>
                    <h5 className="text-base font-bold text-white sm:text-lg">{plan.name}</h5>
                    {plan.tagline && <p className="text-xs text-slate-400">{plan.tagline}</p>}
                  </div>
                </div>

                {plan.price_label?.trim() ? (
                  <p className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {plan.price_label}
                  </p>
                ) : (
                  <p className="mb-3 text-sm font-medium text-slate-500">Precio por confirmar</p>
                )}

                {plan.description && (
                  <p className="mb-4 text-sm leading-relaxed text-slate-300">{plan.description}</p>
                )}

                <ul className="mb-5 flex-1 space-y-2.5">
                  {plan.features.map((feature) => {
                    const isBonus = /canciones|bono/i.test(feature);
                    return (
                      <li
                        key={feature}
                        className={cn(
                          'flex gap-2.5 text-sm',
                          isBonus ? 'text-amber-100' : 'text-slate-200'
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                            isBonus
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-400'
                          )}
                        >
                          {isBonus ? (
                            <Gift className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          )}
                        </span>
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>

                <PurchaseButton
                  label={`${course.title} — ${plan.name}`}
                  paymentLink={plan.payment_link}
                  whatsappUrl={buildWhatsAppUrl(
                    `${course.title} (${plan.name})`,
                    whatsappNumber
                  )}
                  userEmail={userEmail}
                  whatsappNumber={whatsappNumber}
                  isEnrolled={isEnrolled}
                  courseSlug={course.slug}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
