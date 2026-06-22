import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CourseLayoutShell } from '@/components/student/CourseLayoutShell';
import { CourseAccessExpired } from '@/components/student/CourseAccessExpired';
import { isEnrollmentActive } from '@/lib/enrollment-access';
import { isMissingColumnError } from '@/lib/supabase/schema-fallback';

type CourseSidebarModule = {
  id: string;
  title: string;
  order_index: number;
  lessons: {
    id: string;
    title: string;
    order_index: number;
    days_to_unlock: number;
    module_id: string;
  }[];
};

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const supabase = await createClient();

  // 1. Obtener usuario
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?error=Debes iniciar sesión');
  }

  // 2. Obtener curso por slug
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', courseSlug)
    .maybeSingle();

  if (courseError || !course) {
    redirect('/dashboard?error=Curso no encontrado');
  }

  // 3. Verificar inscripción
  const { data: enrollmentWithExpiry, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id, created_at, expires_at')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  let enrollment: { id: string; created_at: string } | null = null;
  let expiresAt: string | null = null;

  if (enrollmentError && isMissingColumnError(enrollmentError)) {
    const { data: enrollmentFallback, error: fallbackError } = await supabase
      .from('enrollments')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle();
    if (fallbackError || !enrollmentFallback) {
      redirect('/dashboard?error=No tienes acceso a este curso');
    }
    enrollment = enrollmentFallback;
  } else if (enrollmentError || !enrollmentWithExpiry) {
    redirect('/dashboard?error=No tienes acceso a este curso');
  } else {
    enrollment = enrollmentWithExpiry;
    expiresAt = (enrollmentWithExpiry as { expires_at?: string | null }).expires_at ?? null;
  }

  if (!isEnrollmentActive(expiresAt)) {
    return (
      <CourseAccessExpired courseTitle={course.title} expiresAt={expiresAt} />
    );
  }

  // 4. Obtener módulos con lecciones
  const { data: modulesRaw } = await supabase
    .from('modules')
    .select(
      `
      id,
      title,
      order_index,
      lessons (
        id,
        title,
        order_index,
        days_to_unlock,
        module_id
      )
    `
    )
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  // 5. Obtener progreso del usuario
  const { data: progressRows } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .eq('is_completed', true);

  const completedLessonIds = (progressRows ?? []).map((p) => p.lesson_id);

  // Normalizar módulos y lecciones
  const rawModules = Array.isArray(modulesRaw) ? modulesRaw : [];
  const modules: CourseSidebarModule[] = rawModules
    .filter((m) => m != null && m.id)
    .map((mod) => {
      const lessonsRaw = (mod as { lessons?: unknown }).lessons ?? [];
      const lessonsList = Array.isArray(lessonsRaw) ? lessonsRaw : [];
      const lessons = lessonsList
        .filter(
          (l): l is { id: string; title: string; order_index: number; days_to_unlock: number; module_id: string } =>
            l != null && typeof l === 'object' && 'id' in l
        )
        .sort((a, b) => a.order_index - b.order_index);

      return {
        id: mod.id,
        title: mod.title ?? '',
        order_index: mod.order_index ?? 0,
        lessons,
      };
    })
    .sort((a, b) => a.order_index - b.order_index);

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  const enrollmentDate = new Date(enrollment.created_at);
  const now = new Date();
  const daysSinceEnrollment = Math.floor(
    (now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const lockedLessonIds = new Set(
    modules.flatMap((m) =>
      m.lessons
        .filter((l) => daysSinceEnrollment < (l.days_to_unlock ?? 0))
        .map((l) => l.id)
    )
  );

  return (
    <CourseLayoutShell
      course={{ id: course.id, title: course.title, slug: course.slug }}
      modules={modules}
      completedLessonIds={completedLessonIds}
      lockedLessonIds={Array.from(lockedLessonIds)}
      totalLessons={totalLessons}
      accessExpiresAt={expiresAt}
    >
      {children}
    </CourseLayoutShell>
  );
}
