import { Check } from 'lucide-react';
import {
  LandingSection,
  SectionEyebrow,
  SectionTitle,
} from '@/components/landing/LandingSection';

const OUTCOMES = [
  'Aprender las bases del acordeón.',
  'Aprender a meter bajo a las canciones.',
  'Dominar las escalas.',
  'Mejorar tu técnica: pulsación.',
  'Desarrollar velocidad.',
  'Aprender canciones.',
  'Entender secretos y técnicas del acordeón.',
  'Avanzar siguiendo un método organizado.',
  'Practicar desde casa y a tu propio ritmo.',
];

export function OutcomesSection() {
  return (
    <LandingSection id="conseguir" tone="base">
      <SectionEyebrow>Resultados reales</SectionEyebrow>
      <SectionTitle>¿Qué vas a conseguir?</SectionTitle>

      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-slate-700/60 bg-slate-950/80 p-4 sm:mt-8 sm:p-8">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-blue-300 sm:text-xs">
          Con el programa podrás
        </p>
        <ul className="space-y-3">
          {OUTCOMES.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-slate-200 sm:text-base">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="min-w-0 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-slate-800 pt-5 text-sm leading-relaxed text-slate-400 sm:text-base">
          Todo el contenido queda organizado dentro de una plataforma para que puedas volver a las
          clases cada vez que lo necesites.
        </p>
      </div>
    </LandingSection>
  );
}
