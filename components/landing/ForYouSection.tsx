import { Check } from 'lucide-react';
import {
  LandingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from '@/components/landing/LandingSection';

const FOR_YOU = [
  'Siempre has querido aprender acordeón.',
  'Ya tienes acordeón pero no sabes por dónde empezar.',
  'Has intentado aprender por YouTube y te has sentido perdido.',
  'Sabes algunas cosas pero quieres organizar tus conocimientos.',
  'Tienes poco tiempo y necesitas un método.',
  'Quieres aprender a tu propio ritmo.',
];

export function ForYouSection() {
  return (
    <LandingSection id="para-ti" tone="alt">
      <SectionEyebrow>Antes de elegir</SectionEyebrow>
      <SectionTitle>¿Este programa es para ti?</SectionTitle>
      <SectionLead>Sí, si eres adulto y te reconoces en alguna de estas situaciones.</SectionLead>

      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 sm:p-8">
        <ul className="space-y-3">
          {FOR_YOU.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-slate-200 sm:text-base">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="min-w-0 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-slate-800 pt-5 text-sm leading-relaxed text-slate-300 sm:text-base">
          No necesitas pasar horas estudiando. Lo importante es tener un método y constancia.
        </p>
      </div>
    </LandingSection>
  );
}
