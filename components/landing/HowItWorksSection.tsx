import { CalendarDays, GraduationCap, PlayCircle, Repeat } from 'lucide-react';
import {
  LandingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from '@/components/landing/LandingSection';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    n: '01',
    title: 'Ves la clase',
    body: 'Las clases son grabadas y están disponibles dentro de la plataforma.',
    icon: PlayCircle,
  },
  {
    n: '02',
    title: 'Practicas',
    body: 'Vas aplicando lo aprendido en tu acordeón.',
    icon: Repeat,
  },
  {
    n: '03',
    title: 'Avanzas',
    body: 'Sigues los módulos en orden y puedes volver a las clases cuando quieras.',
    icon: GraduationCap,
  },
];

export function HowItWorksSection() {
  return (
    <LandingSection id="como-funciona" tone="alt">
      <SectionEyebrow>Tu método</SectionEyebrow>
      <SectionTitle>¿Cómo funciona?</SectionTitle>
      <SectionLead>Así de sencillo es el sistema.</SectionLead>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <article
              key={step.n}
              className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] text-blue-400">
                  {step.n}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{step.body}</p>
            </article>
          );
        })}
      </div>

      <article
        className={cn(
          'mt-4 rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 p-5 sm:mt-6 sm:p-8'
        )}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
            <CalendarDays className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              04 · Si eliges Programa Ganador
            </p>
            <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
              Además de la plataforma, tienes clases en vivo
            </h3>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              4 clases virtuales en vivo cada mes, los sábados a las 2:30 p. m., hora Colombia.
            </p>
          </div>
        </div>
      </article>
    </LandingSection>
  );
}
