'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { restoreLesson, restoreModule } from './actions';
import { RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export type TrashModuleItem = {
  id: string;
  title: string;
  deleted_at: string;
  lessons: { id: string; title: string; deleted_at: string }[];
};

export type TrashLessonItem = {
  id: string;
  title: string;
  deleted_at: string;
  module_id: string;
  module_title: string;
  module_deleted: boolean;
};

type CourseTrashSectionProps = {
  deletedModules: TrashModuleItem[];
  deletedLessons: TrashLessonItem[];
};

function formatDeletedAt(value: string): string {
  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function CourseTrashSection({
  deletedModules,
  deletedLessons,
}: CourseTrashSectionProps) {
  const [isRestoring, startRestoring] = useTransition();
  const isEmpty = deletedModules.length === 0 && deletedLessons.length === 0;

  if (isEmpty) {
    return null;
  }

  const onRestoreModule = (moduleId: string) => {
    startRestoring(async () => {
      const result = await restoreModule(moduleId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Modulo restaurado con sus lecciones');
    });
  };

  const onRestoreLesson = (lessonId: string) => {
    startRestoring(async () => {
      const result = await restoreLesson(lessonId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Leccion restaurada');
    });
  };

  return (
    <Card className="mt-10 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trash2 className="h-5 w-5" />
          Papelera
        </CardTitle>
        <CardDescription>
          Elementos eliminados de este curso. Restaurarlos los vuelve a mostrar a los estudiantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {deletedModules.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Modulos</h3>
            <ul className="space-y-2">
              {deletedModules.map((mod) => (
                <li
                  key={mod.id}
                  className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium">{mod.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Eliminado: {formatDeletedAt(mod.deleted_at)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {mod.lessons.length}{' '}
                      {mod.lessons.length === 1 ? 'leccion' : 'lecciones'}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-2"
                    disabled={isRestoring}
                    onClick={() => onRestoreModule(mod.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restaurar modulo
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {deletedLessons.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Lecciones (modulo activo)
            </h3>
            <ul className="space-y-2">
              {deletedLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Modulo: {lesson.module_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Eliminado: {formatDeletedAt(lesson.deleted_at)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-2"
                    disabled={isRestoring}
                    onClick={() => onRestoreLesson(lesson.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restaurar leccion
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
