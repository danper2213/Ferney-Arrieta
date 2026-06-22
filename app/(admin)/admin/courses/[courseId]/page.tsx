import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AddModuleDialog } from './add-module-dialog';
import { AddLessonDialog } from './add-lesson-dialog';
import { PublishButton } from './publish-button';
import { BunnyUploader } from '@/components/admin/BunnyUploader';
import { LessonVideoMosaic } from '@/components/admin/LessonVideoMosaic';
import { LessonResourcesManager } from '@/components/admin/LessonResourcesManager';
import { LessonMotivationalMessageForm } from '@/components/admin/LessonMotivationalMessageForm';
import { resolveBunnyVideoThumbnailUrl } from '@/app/actions/bunny';
import { type LessonResource } from '@/lib/lesson-resources';
import { BookOpen, Paperclip, Video } from 'lucide-react';
import { ModuleActions } from './module-actions';
import { ModuleReorderButtons } from './module-reorder-buttons';
import { LessonActions } from './lesson-actions';
import { LessonReorderButtons } from './lesson-reorder-buttons';
import { generateBunnyToken } from '@/lib/bunny/token';
import { isMissingColumnError } from '@/lib/supabase/schema-fallback';

type Module = {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  days_to_unlock: number;
  order_index: number;
  video_url?: string | null;
  video_provider_id?: string | null;
  motivational_message?: string | null;
};

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  // Obtener el curso
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .maybeSingle();

  if (courseError || !course) {
    notFound();
  }

  // Obtener módulos con sus lecciones
  const modulesSelectWithMessage = `
      id,
      title,
      order_index,
      lessons (
        id,
        title,
        description,
        days_to_unlock,
        order_index,
        video_provider_id,
        motivational_message
      )
    `;

  const modulesSelectBase = `
      id,
      title,
      order_index,
      lessons (
        id,
        title,
        description,
        days_to_unlock,
        order_index,
        video_provider_id
      )
    `;

  let { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select(modulesSelectWithMessage)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (modulesError && isMissingColumnError(modulesError)) {
    const fallback = await supabase
      .from('modules')
      .select(modulesSelectBase)
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    modules = fallback.data as typeof modules;
    modulesError = fallback.error;
  }

  // Extraer mensaje real del error (Supabase devuelve objeto con message/details/code)
  if (modulesError) {
    const err = modulesError as { message?: string; details?: string; hint?: string; code?: string };
    const errMsg = err?.message || err?.details || err?.hint || err?.code || String(modulesError);
    console.error('Error al obtener módulos:', errMsg);
  }

  // Si hay error, usar array vacío para que la página siga mostrándose
  const rawModules = modulesError ? [] : Array.isArray(modules) ? modules : [];
  const sortedModules: Module[] = rawModules
    .filter((mod) => mod != null && typeof mod === 'object' && mod.id)
    .map((mod) => {
      const lessonsRaw = (mod as { lessons?: unknown }).lessons ?? [];
      const lessonsList = Array.isArray(lessonsRaw) ? lessonsRaw : [];
      const lessons: Lesson[] = lessonsList
        .filter((l): l is Lesson => l != null && typeof l === 'object' && 'id' in l)
        .map((l) => ({
          ...l,
          motivational_message: l.motivational_message ?? null,
        }))
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      return {
        id: mod.id,
        title: mod.title ?? '',
        order_index: mod.order_index ?? 0,
        lessons,
      };
    })
    .sort((a, b) => a.order_index - b.order_index);

  const totalLessons = sortedModules.reduce((acc, module) => acc + module.lessons.length, 0);
  const getLessonEmbedUrl = (videoProviderId?: string | null) => {
    if (!videoProviderId) return null;
    const tokenResult = generateBunnyToken(videoProviderId, 3600);
    if ('error' in tokenResult) return null;
    return tokenResult.embedUrl;
  };

  const lessonsWithVideo = sortedModules.flatMap((module) =>
    module.lessons.filter((lesson) => lesson.video_provider_id)
  );
  const lessonMediaEntries = await Promise.all(
    lessonsWithVideo.map(async (lesson) => {
      const embedUrl = getLessonEmbedUrl(lesson.video_provider_id);
      const thumbnailUrl = lesson.video_provider_id
        ? await resolveBunnyVideoThumbnailUrl(lesson.video_provider_id)
        : null;
      return [lesson.id, { embedUrl, thumbnailUrl }] as const;
    })
  );
  const lessonMedia = Object.fromEntries(lessonMediaEntries) as Record<
    string,
    { embedUrl: string | null; thumbnailUrl: string | null }
  >;

  const allLessonIds = sortedModules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const resourcesByLesson: Record<string, LessonResource[]> = {};

  if (allLessonIds.length > 0) {
    const { data: resourcesRaw, error: resourcesError } = await supabase
      .from('lesson_resources')
      .select(
        'id, lesson_id, title, file_name, storage_path, mime_type, resource_type, file_size, order_index, created_at'
      )
      .in('lesson_id', allLessonIds)
      .order('order_index', { ascending: true });

    if (resourcesError) {
      const err = resourcesError as { message?: string; code?: string };
      if (err.code !== '42P01') {
        console.error('Error al obtener recursos de lección:', err.message ?? resourcesError);
      }
    } else {
      for (const resource of (resourcesRaw ?? []) as LessonResource[]) {
        if (!resourcesByLesson[resource.lesson_id]) {
          resourcesByLesson[resource.lesson_id] = [];
        }
        resourcesByLesson[resource.lesson_id].push(resource);
      }
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      {/* Cabecera */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{course.title}</h1>
              {course.is_published ? (
                <Badge variant="default">
                  Publicado
                </Badge>
              ) : (
                <Badge variant="secondary">Borrador</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{course.description}</p>
          </div>
          <PublishButton courseId={courseId} isPublished={course.is_published} />
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>
              {sortedModules.length} {sortedModules.length === 1 ? 'módulo' : 'módulos'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>
              {totalLessons} {totalLessons === 1 ? 'lección' : 'lecciones'}
            </span>
          </div>
        </div>
      </div>

      {/* Aviso si falló la carga de módulos */}
      {modulesError && (
        <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          No se pudieron cargar los módulos. Comprueba que exista una política RLS de SELECT en las tablas{' '}
          <code className="rounded bg-amber-500/20 px-1">modules</code> y{' '}
          <code className="rounded bg-amber-500/20 px-1">lessons</code>. Puedes agregar un módulo de todas formas.
        </div>
      )}

      {/* Botón Agregar Módulo */}
      <div className="mb-6">
        <AddModuleDialog courseId={courseId} />
      </div>

      {/* Lista de Módulos */}
      {sortedModules.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No hay módulos todavía</p>
              <p className="text-sm">
                Comienza agregando tu primer módulo para organizar el contenido del curso
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {sortedModules.map((module, index) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border rounded-lg overflow-hidden"
            >
              <div className="flex w-full min-w-0 items-center gap-2 px-6 py-2">
                <AccordionTrigger className="min-w-0 flex-1 py-2 hover:bg-muted/50 hover:no-underline [&>svg]:shrink-0">
                  <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Badge variant="outline" className="shrink-0 font-mono">
                      {index + 1}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate font-semibold text-lg">{module.title}</span>
                    <Badge variant="secondary" className="shrink-0">
                      {module.lessons.length}{' '}
                      {module.lessons.length === 1 ? 'lección' : 'lecciones'}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
                  <ModuleReorderButtons
                    moduleId={module.id}
                    canMoveUp={index > 0}
                    canMoveDown={index < sortedModules.length - 1}
                  />
                  <ModuleActions moduleId={module.id} title={module.title} />
                </div>
              </div>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  {/* Botón Agregar Lección */}
                  <div className="flex justify-end pt-2">
                    <AddLessonDialog moduleId={module.id} />
                  </div>

                  {/* Lista de Lecciones */}
                  {module.lessons.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">
                        No hay lecciones en este módulo. Agrega tu primera lección.
                      </p>
                    </div>
                  ) : (
                    <Accordion type="multiple" className="space-y-3">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const media = lessonMedia[lesson.id];
                        const lessonEmbedUrl = media?.embedUrl ?? getLessonEmbedUrl(lesson.video_provider_id);
                        const lessonThumbnailUrl = media?.thumbnailUrl ?? null;
                        const lessonResources = resourcesByLesson[lesson.id] ?? [];
                        return (
                        <Card key={lesson.id} className="overflow-hidden border-border/60 bg-card/50 py-0 shadow-sm">
                          <AccordionItem value={lesson.id} className="border-0">
                            <div className="flex w-full min-w-0 items-center gap-2 border-b border-border/40 bg-muted/20 px-3 py-2 sm:px-4">
                              <AccordionTrigger className="min-w-0 flex-1 py-2 hover:no-underline [&>svg]:shrink-0">
                                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-left">
                                  <Badge variant="outline" className="shrink-0 font-mono text-xs">
                                    {lessonIndex + 1}
                                  </Badge>
                                  <CardTitle className="min-w-0 flex-1 truncate text-base">
                                    {lesson.title}
                                  </CardTitle>
                                  {lesson.video_provider_id || lesson.video_url ? (
                                    <Badge variant="default" className="shrink-0">
                                      <Video className="h-3 w-3 mr-1" />
                                      Video
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="shrink-0">
                                      <Video className="h-3 w-3 mr-1" />
                                      Sin video
                                    </Badge>
                                  )}
                                  {lessonResources.length > 0 && (
                                    <Badge variant="outline" className="shrink-0">
                                      <Paperclip className="h-3 w-3 mr-1" />
                                      {lessonResources.length}{' '}
                                      {lessonResources.length === 1 ? 'recurso' : 'recursos'}
                                    </Badge>
                                  )}
                                </div>
                              </AccordionTrigger>
                              <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
                                <LessonReorderButtons
                                  lessonId={lesson.id}
                                  canMoveUp={lessonIndex > 0}
                                  canMoveDown={lessonIndex < module.lessons.length - 1}
                                />
                                <LessonActions
                                  lessonId={lesson.id}
                                  title={lesson.title}
                                  description={lesson.description}
                                  daysToUnlock={lesson.days_to_unlock}
                                  videoEmbedUrl={lessonEmbedUrl}
                                  videoThumbnailUrl={lessonThumbnailUrl}
                                />
                              </div>
                            </div>
                            <AccordionContent className="px-0 pb-0">
                              <div className="space-y-5 px-3 py-4 sm:px-5 sm:py-5">
                                {lesson.description?.trim() && (
                                  <p className="text-sm leading-relaxed text-muted-foreground">
                                    {lesson.description}
                                  </p>
                                )}

                                <LessonMotivationalMessageForm
                                  lessonId={lesson.id}
                                  lessonTitle={lesson.title}
                                  initialMessage={lesson.motivational_message ?? null}
                                />

                                {lessonEmbedUrl ? (
                                  <div className="overflow-hidden rounded-xl border bg-muted/30 shadow-sm">
                                    <LessonVideoMosaic
                                      title={lesson.title}
                                      embedUrl={lessonEmbedUrl}
                                      thumbnailUrl={lessonThumbnailUrl}
                                      className="max-w-none"
                                    />
                                  </div>
                                ) : (
                                  !lesson.video_provider_id &&
                                  !lesson.video_url && (
                                    <div className="rounded-xl border border-dashed bg-muted/20 p-4">
                                      <BunnyUploader lessonId={lesson.id} lessonTitle={lesson.title} />
                                    </div>
                                  )
                                )}

                                <LessonResourcesManager
                                  lessonId={lesson.id}
                                  resources={lessonResources}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Card>
                        );
                      })}
                    </Accordion>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
