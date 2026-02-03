import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type EnrollmentWithCourse = {
  course_id: string;
  created_at: string;
  courses: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    description: string | null;
  } | null;
};

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?error=Inicia sesión para ver tu panel');
  }

  const { data: enrollmentsRaw = [] } = await supabase
    .from('enrollments')
    .select('course_id, created_at, courses(id, title, slug, thumbnail_url, description)')
    .eq('user_id', user.id);

  const enrollments = (enrollmentsRaw ?? []) as EnrollmentWithCourse[];
  const courseIds = enrollments
    .map((e) => e.courses?.id)
    .filter((id): id is string => !!id);

  let progressByCourse: Record<string, { completed: number; total: number }> = {};

  if (courseIds.length > 0) {
    const { data: progressRows = [] } = await supabase
      .from('progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('is_completed', true);

    const { data: modulesRaw = [] } = await supabase
      .from('modules')
      .select('id, course_id')
      .in('course_id', courseIds);

    const moduleIds = (modulesRaw as { id: string; course_id: string }[]).map((m) => m.id);
    const moduleToCourse = new Map(
      (modulesRaw as { id: string; course_id: string }[]).map((m) => [m.id, m.course_id])
    );

    let lessonsRaw: { id: string; module_id: string }[] = [];
    if (moduleIds.length > 0) {
      const { data: lessonsData = [] } = await supabase
        .from('lessons')
        .select('id, module_id')
        .in('module_id', moduleIds);
      lessonsRaw = lessonsData as { id: string; module_id: string }[];
    }

    const completedLessonIds = new Set(
      (progressRows as { lesson_id: string }[]).map((p) => p.lesson_id)
    );

    const courseTotalLessons: Record<string, number> = {};
    for (const lesson of lessonsRaw) {
      const courseId = moduleToCourse.get(lesson.module_id);
      if (!courseId) continue;
      courseTotalLessons[courseId] = (courseTotalLessons[courseId] ?? 0) + 1;
    }

    const courseCompleted: Record<string, number> = {};
    for (const lessonId of completedLessonIds) {
      const lesson = lessonsRaw.find((l) => l.id === lessonId);
      if (!lesson) continue;
      const courseId = moduleToCourse.get(lesson.module_id);
      if (!courseId) continue;
      courseCompleted[courseId] = (courseCompleted[courseId] ?? 0) + 1;
    }

    for (const courseId of courseIds) {
      progressByCourse[courseId] = {
        completed: courseCompleted[courseId] ?? 0,
        total: courseTotalLessons[courseId] ?? 0,
      };
    }
  }

  const items = enrollments
    .filter((e) => e.courses != null)
    .map((e) => {
      const course = e.courses!;
      const progress = progressByCourse[course.id] ?? { completed: 0, total: 0 };
      const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
      return {
        courseId: course.id,
        title: course.title,
        slug: course.slug,
        thumbnailUrl: course.thumbnail_url,
        description: course.description,
        progressPercent: percent,
        progressLabel: `${progress.completed} de ${progress.total} lecciones`,
        progressTotal: progress.total,
      };
    });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-6xl">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
          <GraduationCap className="h-9 w-9 sm:h-10 sm:w-10" />
          Mis Programas
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Tus cursos activos. Continúa donde lo dejaste.
        </p>
      </header>

      {items.length === 0 ? (
        <Card className="overflow-hidden border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aún no tienes programas activos</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Explora los cursos disponibles y adquiere acceso para empezar a aprender.
            </p>
            <Link
              href="/"
              className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}
            >
              Explorar Cursos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.courseId} className="overflow-hidden flex flex-col">
              <div className="aspect-video relative bg-muted shrink-0">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-14 w-14 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <h3 className="text-lg font-semibold line-clamp-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col gap-4">
                {item.progressTotal > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso</span>
                      <span>{item.progressLabel}</span>
                    </div>
                    <Progress value={item.progressPercent} className="h-2" />
                  </div>
                )}
                <Link
                  href={`/course/${item.slug}`}
                  className={cn(buttonVariants(), 'w-full gap-2 mt-auto')}
                >
                  Continuar Aprendiendo
                  <span aria-hidden>▶️</span>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
