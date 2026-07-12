'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  DEFAULT_DOMINA_PLANS,
  normalizePlanFeatures,
  parseCoursePlanRow,
  type CoursePlan,
} from '@/lib/course-plans';
import { isMissingColumnError, isMissingRelationError } from '@/lib/supabase/schema-fallback';

const planSchema = z.object({
  plan_key: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(120).default(''),
  description: z.string().trim().max(1000).default(''),
  features: z.array(z.string().trim().min(1)).max(12),
  price_label: z.string().trim().max(40).default(''),
  payment_link: z.string().trim().url().optional().or(z.literal('')),
  badge: z.string().trim().max(40).default(''),
  is_highlighted: z.boolean(),
  is_active: z.boolean(),
  order_index: z.number().int().min(0).max(99),
});

async function requireMaster() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' as const, supabase: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'master') {
    return { error: 'No autorizado' as const, supabase: null };
  }

  return { error: null, supabase };
}

export async function getCoursePlans(courseId: string): Promise<CoursePlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course_plans')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (error) {
    if (isMissingRelationError(error) || isMissingColumnError(error)) return [];
    console.error('getCoursePlans:', error);
    return [];
  }

  return (data ?? []).map((row) => parseCoursePlanRow(row as Record<string, unknown>));
}

export async function seedDefaultCoursePlans(
  courseId: string
): Promise<{ success: true } | { error: string }> {
  const auth = await requireMaster();
  if (auth.error || !auth.supabase) return { error: auth.error ?? 'No autorizado' };

  const existing = await getCoursePlans(courseId);
  if (existing.length > 0) {
    return { error: 'Este curso ya tiene planes. Edítalos o elimínalos primero.' };
  }

  const rows = DEFAULT_DOMINA_PLANS.map((plan, index) => ({
    course_id: courseId,
    plan_key: plan.plan_key,
    name: plan.name,
    tagline: plan.tagline,
    description: plan.description,
    features: plan.features,
    price_label: plan.price_label || '',
    payment_link: plan.payment_link || null,
    badge: plan.badge || null,
    is_highlighted: plan.is_highlighted,
    is_active: plan.is_active,
    order_index: index,
  }));

  const { error } = await auth.supabase.from('course_plans').insert(rows);
  if (error) {
    if (isMissingRelationError(error)) {
      return { error: 'Aplica la migración course_plans en Supabase primero.' };
    }
    console.error('seedDefaultCoursePlans:', error);
    return { error: 'No se pudieron crear los planes sugeridos' };
  }

  revalidatePath('/');
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function upsertCoursePlan(
  courseId: string,
  planId: string | null,
  input: z.infer<typeof planSchema>
): Promise<{ success: true; id: string } | { error: string }> {
  const auth = await requireMaster();
  if (auth.error || !auth.supabase) return { error: auth.error ?? 'No autorizado' };

  const parsed = planSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const payload = {
    course_id: courseId,
    plan_key: parsed.data.plan_key,
    name: parsed.data.name,
    tagline: parsed.data.tagline,
    description: parsed.data.description,
    features: normalizePlanFeatures(parsed.data.features),
    price_label: parsed.data.price_label?.trim() || '',
    payment_link: parsed.data.payment_link?.trim() || null,
    badge: parsed.data.badge?.trim() || null,
    is_highlighted: parsed.data.is_highlighted,
    is_active: parsed.data.is_active,
    order_index: parsed.data.order_index,
    updated_at: new Date().toISOString(),
  };

  if (planId) {
    const { error } = await auth.supabase.from('course_plans').update(payload).eq('id', planId);
    if (error) {
      console.error('upsertCoursePlan update:', error);
      return { error: 'No se pudo actualizar el plan' };
    }
    revalidatePath('/');
    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true, id: planId };
  }

  const { data, error } = await auth.supabase
    .from('course_plans')
    .insert(payload)
    .select('id')
    .maybeSingle();

  if (error || !data) {
    console.error('upsertCoursePlan insert:', error);
    return { error: 'No se pudo crear el plan' };
  }

  revalidatePath('/');
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true, id: data.id as string };
}

export async function deleteCoursePlan(
  courseId: string,
  planId: string
): Promise<{ success: true } | { error: string }> {
  const auth = await requireMaster();
  if (auth.error || !auth.supabase) return { error: auth.error ?? 'No autorizado' };

  const { error } = await auth.supabase.from('course_plans').delete().eq('id', planId);
  if (error) {
    console.error('deleteCoursePlan:', error);
    return { error: 'No se pudo eliminar el plan' };
  }

  revalidatePath('/');
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}
