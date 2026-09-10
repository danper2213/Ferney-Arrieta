import {
  LandingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from '@/components/landing/LandingSection';

const MODULES = [
  {
    emoji: '🎹',
    title: 'Módulo 1 — Escalas',
    body: 'Aprende y domina las escalas necesarias para desarrollar seguridad, confianza y fluidez. Trabajamos la parte motriz, el punto importante de este módulo.',
  },
  {
    emoji: '🎵',
    title: 'Módulo 2 — Bajo',
    body: 'Con ejercicios independizamos la mano y te enseño a tocar las canciones con bajo.',
  },
  {
    emoji: '🎯',
    title: 'Módulo 3 — Técnica y secretos del acordeón + velocidad',
    body: 'Desarrolla técnica: pulsación, manejo del fuelle, ritmos, ligaduras y pulsación.',
  },
  {
    emoji: '🎶',
    title: 'Módulo 4 — Canciones',
    body: 'En las canciones aplicamos todo lo aprendido y desarrollado. Es el último módulo.',
  },
];

export function PlatformModulesSection() {
  return (
    <LandingSection id="modulos" tone="base">
      <SectionEyebrow>Dentro de la plataforma</SectionEyebrow>
      <SectionTitle>¿Qué vas a encontrar dentro de la plataforma?</SectionTitle>
      <SectionLead>El camino está organizado en cuatro módulos, para avanzar con claridad.</SectionLead>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((mod, index) => (
          <article
            key={mod.title}
            className="rounded-2xl border border-slate-700/60 bg-slate-950/80 p-5 sm:p-7"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-lg">
                {mod.emoji}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Módulo {index + 1}
              </span>
            </div>
            <h3 className="mb-2 text-lg font-bold text-white sm:text-xl">{mod.title}</h3>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{mod.body}</p>
          </article>
        ))}
      </div>
    </LandingSection>
  );
}
