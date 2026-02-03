'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Lock } from 'lucide-react';

export type CourseSidebarLesson = {
  id: string;
  title: string;
  order_index: number;
  days_to_unlock: number;
  module_id: string;
};

export type CourseSidebarModule = {
  id: string;
  title: string;
  order_index: number;
  lessons: CourseSidebarLesson[];
};

export type CourseSidebarProps = {
  course: { id: string; title: string; slug: string };
  modules: CourseSidebarModule[];
  completedLessonIds: string[];
  lockedLessonIds: string[];
  totalLessons: number;
  onNavigate?: () => void;
};

export function CourseSidebar({
  course,
  modules,
  completedLessonIds,
  lockedLessonIds,
  totalLessons,
  onNavigate,
}: CourseSidebarProps) {
  const pathname = usePathname();
  const completedSet = new Set(completedLessonIds);
  const lockedSet = new Set(lockedLessonIds);

  // Extraer lessonId actual de la URL: /course/[slug]/lesson/[lessonId]
  const pathParts = pathname.split('/');
  const lessonIndex = pathParts.indexOf('lesson');
  const currentLessonId = lessonIndex >= 0 && pathParts[lessonIndex + 1]
    ? pathParts[lessonIndex + 1]
    : null;

  const completedCount = completedSet.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      {/* Barra de Progreso */}
      <div className="p-4 border-b space-y-3">
        <p className="text-sm font-medium">
          Progreso del curso
        </p>
        <div className="w-full">
          <Progress value={progressPercent} className="h-2.5 w-full" />
        </div>
        <p className="text-xs text-muted-foreground">
          {completedCount} de {totalLessons} lecciones completadas ({progressPercent}%)
        </p>
      </div>

      {/* Módulos y Lecciones */}
      <div className="flex-1 overflow-y-auto p-2">
        <Accordion type="multiple" className="w-full" defaultValue={modules.map((m) => m.id)}>
          {modules.map((module) => (
            <AccordionItem key={module.id} value={module.id} className="border-none">
              <AccordionTrigger className="py-3 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                <span className="font-semibold text-sm">{module.title}</span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-0.5 pl-1">
                  {module.lessons.map((lesson) => {
                    const completed = completedSet.has(lesson.id);
                    const locked = lockedSet.has(lesson.id);
                    const isCurrent = lesson.id === currentLessonId;

                    const linkHref = `/course/${course.slug}/lesson/${lesson.id}`;

                    return (
                      <li key={lesson.id}>
                        {locked ? (
                          <div
                            className={`flex items-center gap-2 py-2 px-3 rounded-md text-muted-foreground cursor-not-allowed ${isCurrent ? 'bg-primary/10' : ''
                              }`}
                          >
                            <Lock className="h-4 w-4 shrink-0 text-amber-500" />
                            <span
                              className={`text-sm truncate ${isCurrent ? 'font-semibold text-primary' : ''
                                }`}
                            >
                              {lesson.title}
                            </span>
                          </div>
                        ) : (
                          <Link
                            href={linkHref}
                            onClick={onNavigate}
                            className={`flex items-center gap-2 py-2 px-3 rounded-md transition-colors hover:bg-muted/50 ${isCurrent
                              ? 'bg-primary/15 font-semibold text-primary ring-1 ring-primary/30'
                              : 'text-foreground'
                              }`}
                          >
                            {completed ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                            ) : (
                              <span className="w-4 h-4 shrink-0 rounded-full border-2 border-muted-foreground/40" />
                            )}
                            <span className={`text-sm truncate ${isCurrent ? 'font-semibold' : ''}`}>
                              {lesson.title}
                            </span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
