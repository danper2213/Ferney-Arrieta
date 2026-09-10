import { MessageCircle } from 'lucide-react';
import { LandingSection } from '@/components/landing/LandingSection';
import { PlanPurchaseButton } from '@/components/landing/PlanPurchaseButton';
import type { LandingOffer } from '@/lib/landing-offers';

type ClosingCtaSectionProps = {
  ganador: LandingOffer;
  plataforma: LandingOffer;
  ganadorWhatsappUrl: string;
  plataformaWhatsappUrl: string;
  questionWhatsappUrl: string;
  userEmail: string | null;
  whatsappNumber: string;
  isEnrolled: boolean;
  courseSlug: string | null;
};

export function ClosingCtaSection({
  ganador,
  plataforma,
  ganadorWhatsappUrl,
  plataformaWhatsappUrl,
  questionWhatsappUrl,
  userEmail,
  whatsappNumber,
  isEnrolled,
  courseSlug,
}: ClosingCtaSectionProps) {
  return (
    <LandingSection id="comenzar" tone="base">
      <div className="mx-auto max-w-3xl rounded-2xl border border-blue-500/25 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950 px-4 py-10 text-center sm:px-10 sm:py-14">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          Empieza hoy
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Tu acordeón está esperando
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-lg">
          No necesitas esperar a tener más tiempo. Necesitas comenzar.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
          Elige el programa que mejor se adapte a tu forma de aprender y empieza hoy.
        </p>

        <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3">
          <PlanPurchaseButton
            offerName={`Domina el Acordeón — ${ganador.name}`}
            paymentLink={ganador.paymentLink}
            whatsappUrl={ganadorWhatsappUrl}
            userEmail={userEmail}
            whatsappNumber={whatsappNumber}
            isEnrolled={isEnrolled}
            courseSlug={courseSlug}
            className="bg-emerald-600 shadow-[0_0_24px_rgba(5,150,105,0.35)] hover:bg-emerald-500"
          >
            {ganador.cta}
          </PlanPurchaseButton>
          <PlanPurchaseButton
            offerName={`Domina el Acordeón — ${plataforma.name}`}
            paymentLink={plataforma.paymentLink}
            whatsappUrl={plataformaWhatsappUrl}
            userEmail={userEmail}
            whatsappNumber={whatsappNumber}
            isEnrolled={isEnrolled}
            courseSlug={courseSlug}
            className="bg-blue-600 shadow-[0_0_24px_rgba(37,99,235,0.35)] hover:bg-blue-500"
          >
            {plataforma.cta}
          </PlanPurchaseButton>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-400">¿Tienes una pregunta antes de comprar?</p>
          <a
            href={questionWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-2.5 text-sm font-semibold text-[#4ADE80] transition-colors hover:bg-[#25D366]/20"
          >
            <MessageCircle className="h-4 w-4" />
            Hablar por WhatsApp
          </a>
        </div>
      </div>
    </LandingSection>
  );
}
