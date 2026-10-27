/** Segundos mínimos para considerar que hay un punto de reanudación útil. */
export const RESUME_MIN_SECONDS = 5;

/** Si quedan menos de esto al final, se trata la lección como vista para "continuar". */
export const RESUME_NEAR_END_SECONDS = 20;

export type ProgressWatchRow = {
  lesson_id: string;
  is_completed: boolean | null;
  last_position_seconds?: number | string | null;
  last_watched_at?: string | null;
  completed_at?: string | null;
};

export type CourseLessonRef = {
  id: string;
  days_to_unlock?: number | null;
  module_order_index: number;
  order_index: number;
};

export type ContinueLearningTarget = {
  lessonId: string;
  /** Segundos desde el inicio del video; 0 = desde el principio. */
  positionSeconds: number;
};

function toSeconds(value: number | string | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function activityAt(row: ProgressWatchRow): number {
  const raw = row.last_watched_at ?? row.completed_at;
  if (!raw) return 0;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

function sortLessons(lessons: CourseLessonRef[]): CourseLessonRef[] {
  return [...lessons].sort((a, b) => {
    if (a.module_order_index !== b.module_order_index) {
      return a.module_order_index - b.module_order_index;
    }
    return a.order_index - b.order_index;
  });
}

function isUnlocked(
  lesson: CourseLessonRef,
  daysSinceEnrollment: number
): boolean {
  return daysSinceEnrollment >= (lesson.days_to_unlock ?? 0);
}

function findNextIncompleteUnlocked(
  sorted: CourseLessonRef[],
  fromIndex: number,
  completedIds: Set<string>,
  daysSinceEnrollment: number
): CourseLessonRef | null {
  for (let i = fromIndex + 1; i < sorted.length; i++) {
    const lesson = sorted[i];
    if (completedIds.has(lesson.id)) continue;
    if (!isUnlocked(lesson, daysSinceEnrollment)) continue;
    return lesson;
  }
  for (let i = 0; i <= fromIndex; i++) {
    const lesson = sorted[i];
    if (completedIds.has(lesson.id)) continue;
    if (!isUnlocked(lesson, daysSinceEnrollment)) continue;
    return lesson;
  }
  return null;
}

/**
 * Resuelve a qué lección (y minuto) debe llevar "Continuar aprendiendo".
 * Prioridad: última actividad de visionado; si esa lección ya está completa
 * (o casi al final), salta a la siguiente incompleta desbloqueada.
 */
export function resolveContinueLearningTarget(
  lessons: CourseLessonRef[],
  progressRows: ProgressWatchRow[],
  daysSinceEnrollment: number
): ContinueLearningTarget | null {
  const sorted = sortLessons(lessons);
  if (sorted.length === 0) return null;

  const lessonIds = new Set(sorted.map((l) => l.id));
  const progressInCourse = progressRows.filter((p) => lessonIds.has(p.lesson_id));
  const completedIds = new Set(
    progressInCourse.filter((p) => p.is_completed).map((p) => p.lesson_id)
  );

  const byActivity = [...progressInCourse].sort(
    (a, b) => activityAt(b) - activityAt(a)
  );
  const last = byActivity[0];

  if (last) {
    const index = sorted.findIndex((l) => l.id === last.lesson_id);
    const position = toSeconds(last.last_position_seconds);
    const lastLesson = index >= 0 ? sorted[index] : null;

    if (last.is_completed) {
      const next = findNextIncompleteUnlocked(
        sorted,
        index >= 0 ? index : -1,
        completedIds,
        daysSinceEnrollment
      );
      if (next) {
        return { lessonId: next.id, positionSeconds: 0 };
      }
      return {
        lessonId: last.lesson_id,
        positionSeconds: position >= RESUME_MIN_SECONDS ? position : 0,
      };
    }

    if (lastLesson && isUnlocked(lastLesson, daysSinceEnrollment)) {
      return {
        lessonId: last.lesson_id,
        positionSeconds: position >= RESUME_MIN_SECONDS ? position : 0,
      };
    }
  }

  const firstIncomplete = findNextIncompleteUnlocked(
    sorted,
    -1,
    completedIds,
    daysSinceEnrollment
  );
  if (firstIncomplete) {
    const row = progressInCourse.find((p) => p.lesson_id === firstIncomplete.id);
    const position = toSeconds(row?.last_position_seconds);
    return {
      lessonId: firstIncomplete.id,
      positionSeconds: position >= RESUME_MIN_SECONDS ? position : 0,
    };
  }

  return { lessonId: sorted[0].id, positionSeconds: 0 };
}

export function buildContinueLearningHref(
  courseSlug: string,
  target: ContinueLearningTarget
): string {
  const base = `/course/${courseSlug}/lesson/${target.lessonId}`;
  if (target.positionSeconds >= RESUME_MIN_SECONDS) {
    return `${base}?t=${target.positionSeconds}`;
  }
  return base;
}

export function parseResumeSeconds(
  raw: string | string[] | undefined
): number {
  if (raw == null) return 0;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

/** Añade el parámetro `t` de Bunny Stream a una URL de embed. */
export function appendEmbedStartTime(
  embedUrl: string,
  startSeconds: number
): string {
  if (startSeconds < RESUME_MIN_SECONDS) return embedUrl;
  try {
    const url = new URL(embedUrl);
    url.searchParams.set('t', String(startSeconds));
    return url.toString();
  } catch {
    const sep = embedUrl.includes('?') ? '&' : '?';
    return `${embedUrl}${sep}t=${startSeconds}`;
  }
}
