import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { generateBunnyToken } from '@/lib/bunny/token';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, ChevronLeft, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { CommentsSection } from '@/components/student/CommentsSection';
import { MarkAsViewedButton } from '@/components/student/MarkAsViewedButton';

type LessonWithModule = {
  id: string;
  title: string;
  description: string;
  video_provider_id: string | null;
  days_to_unlock: number;
  order_index: number;
  module_id: string;
  modules: {
    id: string;
    title: string;
    order_index: number;
    course_id: string;
  };
};

type FlatLesson = {
  id: string;
  title: string;
  order_index: number;
  module_order_index: number;
};

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug, lessonId } = await params;
  const supabase = await createClient();

  // 1. Obtener usuario actual
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?error=Debes iniciar sesión para ver esta lección');
  }

  // 2. Obtener el curso por slug
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', courseSlug)
    .maybeSingle();

  if (courseError || !course) {
    redirect('/dashboard?error=Curso no encontrado');
  }

  // 3. Verificar inscripción del usuario en este curso
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id, created_at')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  if (enrollmentError || !enrollment) {
    redirect('/dashboard?error=No tienes acceso a este curso');
  }

  // 4. Obtener la lección con información del módulo
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select(
      `
      id,
      title,
      description,
      video_provider_id,
      days_to_unlock,
      order_index,
      module_id,
      modules!inner (
        id,
        title,
        order_index,
        course_id
      )
    `
    )
    .eq('id', lessonId)
    .maybeSingle();

  if (lessonError || !lesson) {
    redirect(`/dashboard?error=Lección no encontrada`);
  }

  // Verificar que la lección pertenece al curso correcto
  const lessonData = lesson as unknown as LessonWithModule;
  if (lessonData.modules.course_id !== course.id) {
    redirect('/dashboard?error=Esta lección no pertenece al curso');
  }

  // 5. Lógica Drip Content - calcular si la lección está desbloqueada
  const enrollmentDate = new Date(enrollment.created_at);
  const unlockDate = new Date(enrollmentDate);
  unlockDate.setDate(unlockDate.getDate() + (lessonData.days_to_unlock || 0));
  const now = new Date();
  const isLocked = now < unlockDate;

  // 6. Obtener todas las lecciones del curso para navegación
  const { data: allLessons } = await supabase
    .from('lessons')
    .select(
      `
      id,
      title,
      order_index,
      modules!inner (
        order_index,
        course_id
      )
    `
    )
    .eq('modules.course_id', course.id);

  // Ordenar lecciones: primero por módulo, luego por orden dentro del módulo
  const sortedLessons: FlatLesson[] = (allLessons || [])
    .map((l) => {
      const mod = l.modules as unknown as { order_index: number };
      return {
        id: l.id,
        title: l.title,
        order_index: l.order_index,
        module_order_index: mod?.order_index ?? 0,
      };
    })
    .sort((a, b) => {
      if (a.module_order_index !== b.module_order_index) {
        return a.module_order_index - b.module_order_index;
      }
      return a.order_index - b.order_index;
    });

  // Encontrar índice actual y lecciones anterior/siguiente
  const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  // Obtener comentarios
  const { data: commentsRaw = [] } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true });

  // Obtener display_name de profiles para los autores
  const userIds = [...new Set((commentsRaw as { user_id: string }[]).map((c) => c.user_id))];
  const { data: profilesData = [] } =
    userIds.length > 0
      ? await supabase.from('profiles').select('id, display_name').in('id', userIds)
      : { data: [] };

  const profilesMap = new Map(
    (profilesData as { id: string; display_name: string | null }[]).map((p) => [p.id, p])
  );

  const comments = (commentsRaw as { id: string; content: string; created_at: string; user_id: string }[]).map(
    (c) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      profiles: profilesMap.get(c.user_id)
        ? { display_name: profilesMap.get(c.user_id)!.display_name }
        : null,
    })
  );

  // 7. Generar token para el video (solo si está desbloqueado y hay video)
  let embedUrl: string | null = null;
  let tokenError: string | null = null;

  if (!isLocked && lessonData.video_provider_id) {
    const tokenResult = generateBunnyToken(lessonData.video_provider_id, 3600);
    if ('error' in tokenResult) {
      tokenError = tokenResult.error;
    } else {
      embedUrl = tokenResult.embedUrl;
    }
  }

  // Formatear fecha de desbloqueo
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const daysUntilUnlock = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </Link>
              <div>
                <p className="text-sm text-muted-foreground">{course.title}</p>
                <h1 className="text-lg font-semibold">{lessonData.title}</h1>
              </div>
            </div>
            <Badge variant="outline">
              {currentIndex + 1} / {sortedLessons.length}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* UI de Clase Bloqueada */}
        {isLocked ? (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Clase Bloqueada 🔒</CardTitle>
              <CardDescription className="text-base">
                Esta lección aún no está disponible
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="rounded-lg bg-muted/50 p-6">
                <div className="flex items-center justify-center gap-2 text-lg mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Disponible el:</span>
                </div>
                <p className="text-xl font-semibold text-primary capitalize">
                  {formatDate(unlockDate)}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {daysUntilUnlock === 1
                    ? 'Falta 1 día'
                    : `Faltan ${daysUntilUnlock} días`}
                </p>
              </div>

              <p className="text-muted-foreground max-w-md mx-auto">
                El contenido de esta clase se desbloquea automáticamente{' '}
                <strong>{lessonData.days_to_unlock} días</strong> después de tu inscripción.
                ¡Sigue aprendiendo con las lecciones disponibles!
              </p>

              {/* Navegación cuando está bloqueado */}
              <div className="flex items-center justify-center gap-4 pt-4">
                {prevLesson && (
                  <Link href={`/course/${courseSlug}/lesson/${prevLesson.id}`}>
                    <Button variant="outline" className="gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Lección anterior
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button>Ir al Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Video Player */}
            <div className="mb-6">
              {lessonData.video_provider_id && embedUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                  />
                </div>
              ) : lessonData.video_provider_id && tokenError ? (
                <Card className="aspect-video flex items-center justify-center">
                  <CardContent className="text-center">
                    <p className="text-destructive">Error al cargar el video: {tokenError}</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="aspect-video flex items-center justify-center bg-muted">
                  <CardContent className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      El video de esta lección estará disponible pronto
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Navegación */}
            <div className="flex items-center justify-between mb-8">
              {prevLesson ? (
                <Link href={`/course/${courseSlug}/lesson/${prevLesson.id}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Anterior:</span>
                    <span className="max-w-[150px] truncate">{prevLesson.title}</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              <MarkAsViewedButton
                lessonId={lessonId}
                courseSlug={courseSlug}
                nextLessonId={nextLesson?.id ?? null}
              />
            </div>

            {/* Información de la lección */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {lessonData.modules.title}
                    </Badge>
                    <CardTitle className="text-2xl">{lessonData.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{lessonData.description}</p>
              </CardContent>
            </Card>

            {/* Comentarios */}
            <CommentsSection lessonId={lessonId} courseSlug={courseSlug} comments={comments} />
          </>
        )}
      </main>
    </div>
  );
}
