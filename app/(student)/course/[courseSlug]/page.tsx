import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isMissingColumnError } from '@/lib/supabase/schema-fallback';
import {
  buildContinueLearningHref,
  resolveContinueLearningTarget,
  type CourseLessonRef,
  type ProgressWatchRow,
} from '@/lib/student/continue-learning';

export default async function CourseSlugPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?error=Debes iniciar sesión');
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .maybeSingle();

  if (!course) {
    redirect('/');
  }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('created_at')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  if (!enrollment) {
    redirect('/dashboard?error=No tienes acceso a este curso');
  }

  const enrollmentDate = new Date(enrollment.created_at);
  const daysSinceEnrollment = Math.floor(
    (Date.now() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const { data: modulesList } = await supabase
    .from('modules')
    .select('id, order_index')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  const modules = (modulesList ?? []) as { id: string; order_index: number }[];
  const moduleIds = modules.map((m) => m.id);
  const moduleOrder = new Map(modules.map((m) => [m.id, m.order_index]));

  if (moduleIds.length === 0) {
    redirect('/dashboard');
  }

  const { data: lessonsRaw } = await supabase
    .from('lessons')
    .select('id, module_id, order_index, days_to_unlock')
    .in('module_id', moduleIds);

  const lessons: CourseLessonRef[] = (
    (lessonsRaw ?? []) as {
      id: string;
      module_id: string;
      order_index: number;
      days_to_unlock: number | null;
    }[]
  ).map((l) => ({
    id: l.id,
    order_index: l.order_index,
    days_to_unlock: l.days_to_unlock,
    module_order_index: moduleOrder.get(l.module_id) ?? 0,
  }));

  let progressRows: ProgressWatchRow[] = [];
  const { data: progressWithWatch, error: progressError } = await supabase
    .from('progress')
    .select('lesson_id, is_completed, last_position_seconds, last_watched_at, completed_at')
    .eq('user_id', user.id);

  if (progressError && isMissingColumnError(progressError)) {
    const { data: progressFallback } = await supabase
      .from('progress')
      .select('lesson_id, is_completed, completed_at')
      .eq('user_id', user.id);
    progressRows = ((progressFallback ?? []) as ProgressWatchRow[]).map((p) => ({
      ...p,
      last_position_seconds: 0,
      last_watched_at: p.completed_at ?? null,
    }));
  } else {
    progressRows = (progressWithWatch ?? []) as ProgressWatchRow[];
  }

  const target = resolveContinueLearningTarget(
    lessons,
    progressRows,
    daysSinceEnrollment
  );

  if (target) {
    redirect(buildContinueLearningHref(courseSlug, target));
  }

  redirect('/dashboard');
}
