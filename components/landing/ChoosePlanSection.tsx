import { Check } from 'lucide-react';
import {
  LandingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from '@/components/landing/LandingSection';
import { PlanPurchaseButton } from '@/components/landing/PlanPurchaseButton';
import type { LandingOffer } from '@/lib/landing-offers';
import { cn } from '@/lib/utils';

type ChoosePlanSectionProps = {
  ganador: LandingOffer;
  plataforma: LandingOffer;
  ganadorWhatsappUrl: string;
  plataformaWhatsappUrl: string;
  userEmail: string | null;
  whatsappNumber: string;
  isEnrolled: boolean;
  courseSlug: string | null;
};

export function ChoosePlanSection({
  ganador,
  plataforma,
  ganadorWhatsappUrl,
  plataformaWhatsappUrl,
  userEmail,
  whatsappNumber,
  isEnrolled,
  courseSlug,
}: ChoosePlanSectionProps) {
  return (
    <LandingSection id="elige" tone="base">
      <SectionEyebrow>Planes</SectionEyebrow>
      <SectionTitle>Elige cómo quieres aprender</SectionTitle>
      <SectionLead>Dos caminos. El mismo método. Tú decides si avanzas acompañado o a tu ritmo.</SectionLead>

      <div className="grid gap-5 lg:grid-cols-2">
        <PlanCard
          offer={ganador}
          optionLabel="Opción 1"
          whatsappUrl={ganadorWhatsappUrl}
          userEmail={userEmail}
          whatsappNumber={whatsappNumber}
          isEnrolled={isEnrolled}
          courseSlug={courseSlug}
          highlighted
        />
        <PlanCard
          offer={plataforma}
          optionLabel="Opción 2"
          whatsappUrl={plataformaWhatsappUrl}
          userEmail={userEmail}
          whatsappNumber={whatsappNumber}
          isEnrolled={isEnrolled}
          courseSlug={courseSlug}
        />
      </div>
    </LandingSection>
  );
}

function PlanCard({
  offer,
  optionLabel,
  whatsappUrl,
  userEmail,
  whatsappNumber,
  isEnrolled,
  courseSlug,
  highlighted = false,
}: {
  offer: LandingOffer;
  optionLabel: string;
  whatsappUrl: string;
  userEmail: string | null;
  whatsappNumber: string;
  isEnrolled: boolean;
  courseSlug: string | null;
  highlighted?: boolean;
}) {
  const isGanador = offer.key === 'ganador';

  return (
    <article
      className={cn(
        'flex flex-col rounded-2xl border p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:p-8',
        highlighted
          ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950'
          : 'border-blue-500/40 bg-gradient-to-b from-blue-950/30 via-slate-950 to-slate-950'
      )}
    >
      <p
        className={cn(
          'mb-2 text-xs font-semibold uppercase tracking-[0.18em]',
          isGanador ? 'text-emerald-300' : 'text-blue-300'
        )}
      >
        {optionLabel}
      </p>
      <h3 className="text-2xl font-bold text-white sm:text-3xl">{offer.name}</h3>
      <p className="mt-1 text-sm text-slate-400">{offer.tagline}</p>
      <p className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {offer.priceLabel}
      </p>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Incluye
      </p>
      <ul className="mt-3 flex-1 space-y-2.5">
        {offer.includes.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-slate-200">
            <span
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                isGanador ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="min-w-0 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm leading-relaxed text-slate-400">{offer.ideal}</p>

      <div className="mt-6">
        <PlanPurchaseButton
          offerName={`Domina el Acordeón — ${offer.name}`}
          paymentLink={offer.paymentLink}
          whatsappUrl={whatsappUrl}
          userEmail={userEmail}
          whatsappNumber={whatsappNumber}
          isEnrolled={isEnrolled}
          courseSlug={courseSlug}
          className={
            isGanador
              ? 'bg-emerald-600 shadow-[0_0_24px_rgba(5,150,105,0.35)] hover:bg-emerald-500'
              : 'bg-blue-600 shadow-[0_0_24px_rgba(37,99,235,0.35)] hover:bg-blue-500'
          }
        >
          {offer.cta}
        </PlanPurchaseButton>
      </div>
    </article>
  );
}
