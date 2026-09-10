import { Check, Minus } from 'lucide-react';
import {
  LandingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from '@/components/landing/LandingSection';
import type { LandingOffer } from '@/lib/landing-offers';

type PlanComparisonSectionProps = {
  ganador: LandingOffer;
  plataforma: LandingOffer;
};

const ROWS: { label: string; plataforma: boolean | string; ganador: boolean | string }[] = [
  { label: '4 módulos', plataforma: true, ganador: true },
  { label: 'Escalas', plataforma: true, ganador: true },
  { label: 'Bajo', plataforma: true, ganador: true },
  { label: 'Técnica y velocidad', plataforma: true, ganador: true },
  { label: 'Canciones', plataforma: true, ganador: true },
  { label: 'Clases virtuales en vivo', plataforma: false, ganador: '4 al mes' },
  { label: 'Modalidad', plataforma: 'A tu ritmo', ganador: 'Acompañado' },
];

export function PlanComparisonSection({ ganador, plataforma }: PlanComparisonSectionProps) {
  return (
    <LandingSection id="comparar" tone="alt">
      <SectionEyebrow>Comparación</SectionEyebrow>
      <SectionTitle>Elige sin adivinar</SectionTitle>
      <SectionLead>Mira lado a lado qué incluye cada opción y decide con claridad.</SectionLead>

      <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-950/80">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm sm:text-base">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-4 py-4 font-semibold text-slate-400 sm:px-6"> </th>
              <th className="px-4 py-4 font-bold text-blue-300 sm:px-6">Plataforma</th>
              <th className="px-4 py-4 font-bold text-emerald-300 sm:px-6">Programa Ganador</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-slate-800/80 last:border-0">
                <th className="px-4 py-3.5 font-medium text-slate-200 sm:px-6">{row.label}</th>
                <td className="px-4 py-3.5 text-slate-300 sm:px-6">
                  <CellValue value={row.plataforma} />
                </td>
                <td className="px-4 py-3.5 text-slate-300 sm:px-6">
                  <CellValue value={row.ganador} accent="emerald" />
                </td>
              </tr>
            ))}
            <tr>
              <th className="px-4 py-3.5 font-medium text-slate-200 sm:px-6">Precio</th>
              <td className="px-4 py-3.5 font-semibold text-white sm:px-6">
                {plataforma.comparisonPrice}
              </td>
              <td className="px-4 py-3.5 font-semibold text-white sm:px-6">
                {ganador.comparisonPrice}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-slate-700/50 bg-slate-900/70 px-4 py-5 text-center sm:px-6">
        <p className="text-sm font-semibold text-white sm:text-base">¿No sabes cuál elegir?</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
          Si quieres aprender por tu cuenta → <span className="text-blue-300">Plataforma</span>.
          <br className="hidden sm:block" />{' '}
          Si quieres tener clases en vivo y acompañamiento →{' '}
          <span className="text-emerald-300">Programa Ganador</span>.
        </p>
      </div>
    </LandingSection>
  );
}

function CellValue({
  value,
  accent = 'blue',
}: {
  value: boolean | string;
  accent?: 'blue' | 'emerald';
}) {
  if (value === true) {
    return (
      <span
        className={
          accent === 'emerald'
            ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300'
            : 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-300'
        }
        aria-label="Incluido"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex items-center text-slate-500" aria-label="No incluido">
        <Minus className="h-4 w-4" />
      </span>
    );
  }

  return <span>{value}</span>;
}
