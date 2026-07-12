export type CoursePlan = {
  id: string;
  course_id: string;
  plan_key: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  price_label: string;
  payment_link: string | null;
  badge: string | null;
  is_highlighted: boolean;
  is_active: boolean;
  order_index: number;
};

export type CoursePlanInput = {
  plan_key: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  price_label: string;
  payment_link: string;
  badge: string;
  is_highlighted: boolean;
  is_active: boolean;
  order_index: number;
};

/** Planes sugeridos para Domina el Acordeón + mentorías */
export const DEFAULT_DOMINA_PLANS: Omit<CoursePlanInput, 'order_index'>[] = [
  {
    plan_key: 'anual',
    name: 'Acceso Anual',
    tagline: 'Solo el programa base',
    description:
      'Acceso durante 1 año completo al programa Domina el Acordeón. Ideal para avanzar a tu ritmo.',
    features: [
      'Acceso completo a Domina el Acordeón por 12 meses',
      'Todo el contenido estructurado de la plataforma',
      'Bono al culminar: Programa de Canciones',
    ],
    price_label: '',
    payment_link: '',
    badge: '1 año',
    is_highlighted: false,
    is_active: true,
  },
  {
    plan_key: 'vip',
    name: 'Programa VIP',
    tagline: 'Acompañamiento personalizado',
    description:
      'Acceso a la plataforma Domina el Acordeón con mentorías en vivo 1:1 y comunidad privada.',
    features: [
      'Acceso completo a la plataforma Domina el Acordeón',
      '4 mentorías en vivo personalizadas',
      'Acceso al grupo privado de WhatsApp',
      'Bono al culminar: Programa de Canciones',
    ],
    price_label: '',
    payment_link: '',
    badge: 'Personalizado',
    is_highlighted: false,
    is_active: true,
  },
  {
    plan_key: 'ganador',
    name: 'Programa Ganador',
    tagline: 'Ritmo semanal en comunidad',
    description:
      'La plataforma más mentorías grupales los sábados y un grupo privado cada mes.',
    features: [
      'Acceso completo a la plataforma Domina el Acordeón',
      'Mentorías grupales los sábados',
      'Grupo privado al mes',
      'Bono al culminar: Programa de Canciones',
    ],
    price_label: '',
    payment_link: '',
    badge: 'Más elegido',
    is_highlighted: true,
    is_active: true,
  },
  {
    plan_key: 'vip_plus',
    name: 'Programa VIP Plus',
    tagline: 'Máximo acompañamiento',
    description:
      'Todo el poder de la plataforma con el doble de mentorías personalizadas en vivo.',
    features: [
      'Acceso completo a la plataforma Domina el Acordeón',
      '8 mentorías en vivo personalizadas',
      'Bono al culminar: Programa de Canciones',
    ],
    price_label: '',
    payment_link: '',
    badge: 'Premium',
    is_highlighted: false,
    is_active: true,
  },
];

export function normalizePlanFeatures(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

export function parseCoursePlanRow(row: Record<string, unknown>): CoursePlan {
  return {
    id: String(row.id),
    course_id: String(row.course_id),
    plan_key: String(row.plan_key ?? ''),
    name: String(row.name ?? ''),
    tagline: String(row.tagline ?? ''),
    description: String(row.description ?? ''),
    features: normalizePlanFeatures(row.features),
    price_label: String(row.price_label ?? ''),
    payment_link: (row.payment_link as string | null) ?? null,
    badge: (row.badge as string | null) ?? null,
    is_highlighted: Boolean(row.is_highlighted),
    is_active: row.is_active !== false,
    order_index: Number(row.order_index ?? 0),
  };
}
