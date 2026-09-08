import type { CoursePlan } from '@/lib/course-plans';

export type LandingOfferKey = 'ganador' | 'plataforma';

export type LandingOffer = {
  key: LandingOfferKey;
  name: string;
  tagline: string;
  priceLabel: string;
  comparisonPrice: string;
  paymentLink: string | null;
  includes: string[];
  ideal: string;
  cta: string;
};

const GANADOR_INCLUDES = [
  'Acceso a los 4 módulos',
  'Escalas',
  'Bajo',
  'Técnica, secretos y velocidad',
  'Canciones',
  '4 clases virtuales en vivo al mes',
  'Clases los sábados a las 12:30 p. m. y 2:30 p. m., hora Colombia',
  'Una estructura para avanzar acompañado',
];

const PLATAFORMA_INCLUDES = [
  'Acceso a los 4 módulos',
  'Escalas',
  'Bajo',
  'Técnica, secretos y velocidad',
  'Canciones',
  'Acceso durante un año',
  'Aprende cuando quieras',
  'Repasa las clases las veces que necesites',
];

const DEFAULT_GANADOR: LandingOffer = {
  key: 'ganador',
  name: 'Programa Ganador',
  tagline: 'Plataforma + acompañamiento en vivo',
  priceLabel: '$300.000',
  comparisonPrice: '$250.000/mes*',
  paymentLink: null,
  includes: GANADOR_INCLUDES,
  ideal:
    'Ideal si quieres aprender con el contenido grabado pero además quieres tener clases en vivo para resolver dudas y seguir avanzando.',
  cta: 'Quiero el Programa Ganador',
};

const DEFAULT_PLATAFORMA: LandingOffer = {
  key: 'plataforma',
  name: 'Plataforma',
  tagline: 'Aprende a tu propio ritmo',
  priceLabel: '$500.000 / año un solo pago',
  comparisonPrice: '$500.000/año',
  paymentLink: null,
  includes: PLATAFORMA_INCLUDES,
  ideal: 'Ideal si tienes disciplina y prefieres aprender de manera independiente.',
  cta: 'Quiero la Plataforma',
};

function matchPlan(plans: CoursePlan[], test: (plan: CoursePlan) => boolean) {
  return plans.find((plan) => plan.is_active !== false && test(plan));
}

function withPlanPrice(base: LandingOffer, plan: CoursePlan | undefined): LandingOffer {
  const price = plan?.price_label?.trim() || '';
  const paymentLink = plan?.payment_link?.trim() || null;
  return {
    ...base,
    priceLabel: price || base.priceLabel,
    comparisonPrice: price || base.comparisonPrice,
    paymentLink,
  };
}

export function resolveLandingOffers(plans: CoursePlan[]): {
  ganador: LandingOffer;
  plataforma: LandingOffer;
} {
  const ganadorPlan = matchPlan(plans, (plan) =>
    /ganador/i.test(`${plan.plan_key} ${plan.name}`)
  );
  const plataformaPlan = matchPlan(
    plans,
    (plan) =>
      /anual|plataforma|acceso anual/i.test(`${plan.plan_key} ${plan.name}`) &&
      !/ganador|vip/i.test(`${plan.plan_key} ${plan.name}`)
  );

  return {
    ganador: withPlanPrice(DEFAULT_GANADOR, ganadorPlan),
    plataforma: withPlanPrice(DEFAULT_PLATAFORMA, plataformaPlan),
  };
}
