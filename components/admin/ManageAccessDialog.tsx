'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnrollmentAccessSummary } from '@/components/shared/EnrollmentAccessSummary';
import {
  grantEnrollment,
  revokeEnrollment,
  updateEnrollmentDuration,
  type ManageEnrollmentResult,
} from '@/app/actions/admin/enrollments';
import type { StudentRow, CourseOption, StudentEnrollment } from '@/lib/admin/students-types';
import {
  ACCESS_DURATION_PRESETS,
  getDaysUntilExpiry,
  isEnrollmentActive,
  resolveDefaultAccessDays,
} from '@/lib/enrollment-access';
import { BookOpen, Loader2, ShieldOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ManageAccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentRow;
  courses: CourseOption[];
  onEnrollmentChange?: (
    userId: string,
    courseId: string,
    update: { expiresAt: string | null; removed?: boolean; createdAt?: string }
  ) => void;
};

function enrollmentMap(enrollments: StudentEnrollment[]) {
  return new Map(enrollments.map((e) => [e.courseId, e]));
}

function inferSelectedAccessDays(enrollment: StudentEnrollment): number | null | undefined {
  if (!enrollment.expiresAt) return null;
  const daysLeft = getDaysUntilExpiry(enrollment.expiresAt);
  if (daysLeft === null) return undefined;
  const match = ACCESS_DURATION_PRESETS.find(
    (preset) => preset.days != null && Math.abs(daysLeft - preset.days) <= 1
  );
  return match?.days;
}

export function ManageAccessDialog({
  open,
  onOpenChange,
  student,
  courses,
  onEnrollmentChange,
}: ManageAccessDialogProps) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState(student.enrollments);
  const [durationDaysByCourse, setDurationDaysByCourse] = useState<
    Record<string, number | null | undefined>
  >({});

  useEffect(() => {
    if (!open) return;
    setEnrollments(student.enrollments);
    setDurationDaysByCourse({});
    setPendingKey(null);
  }, [open, student.id]);

  const byCourse = useMemo(() => enrollmentMap(enrollments), [enrollments]);

  const getSelectedDays = (course: CourseOption, enrollment?: StudentEnrollment) => {
    if (durationDaysByCourse[course.id] !== undefined) {
      return durationDaysByCourse[course.id];
    }
    if (enrollment) {
      const inferred = inferSelectedAccessDays(enrollment);
      if (inferred !== undefined) return inferred;
    }
    return resolveDefaultAccessDays(course.defaultAccessDays);
  };

  const applyEnrollmentUpdate = (
    courseId: string,
    result: ManageEnrollmentResult,
    accessDays: number | null
  ) => {
    if (!('success' in result) || !result.success) return;

    if (result.removed) {
      setEnrollments((prev) => prev.filter((e) => e.courseId !== courseId));
      setDurationDaysByCourse((prev) => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
      onEnrollmentChange?.(student.id, courseId, { expiresAt: null, removed: true });
      return;
    }

    setDurationDaysByCourse((prev) => ({ ...prev, [courseId]: accessDays }));
    setEnrollments((prev) => {
      const existing = prev.find((e) => e.courseId === courseId);
      if (existing) {
        return prev.map((e) =>
          e.courseId === courseId ? { ...e, expiresAt: result.expiresAt } : e
        );
      }
      return [
        ...prev,
        {
          courseId,
          expiresAt: result.expiresAt,
          createdAt: new Date().toISOString(),
        },
      ];
    });
    onEnrollmentChange?.(student.id, courseId, {
      expiresAt: result.expiresAt,
      createdAt: new Date().toISOString(),
    });
  };

  const runAction = async (
    key: string,
    courseId: string,
    accessDays: number | null,
    action: () => Promise<ManageEnrollmentResult>
  ) => {
    setPendingKey(key);
    const result = await action();
    setPendingKey(null);
    if ('error' in result && result.error) {
      toast.error(result.error);
      return;
    }
    applyEnrollmentUpdate(courseId, result, accessDays);
    toast.success('Acceso actualizado');
  };

  const activeCount = enrollments.filter((e) => isEnrollmentActive(e.expiresAt)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-5 text-left">
          <DialogTitle className="text-xl">Acceso a cursos</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 pt-1">
              <p>
                <span className="font-medium text-foreground">
                  {student.displayName ?? student.email ?? 'Estudiante'}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {activeCount} {activeCount === 1 ? 'curso activo' : 'cursos activos'}
                </Badge>
                <Badge variant="outline">
                  {courses.length} {courses.length === 1 ? 'curso disponible' : 'cursos disponibles'}
                </Badge>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {courses.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay cursos disponibles.
            </p>
          ) : (
            courses.map((course) => {
              const enrollment = byCourse.get(course.id);
              const isActive = enrollment ? isEnrollmentActive(enrollment.expiresAt) : false;
              const selectedDays = getSelectedDays(course, enrollment);
              const cardKey = course.id;

              return (
                <article
                  key={course.id}
                  className={cn(
                    'rounded-xl border p-4 transition-colors',
                    isActive ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : 'bg-muted/20'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={cn(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isActive ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold leading-tight">{course.title}</h3>
                      </div>
                    </div>
                  </div>

                  {isActive && enrollment && (
                    <div className="mt-4 space-y-4">
                      <EnrollmentAccessSummary
                        expiresAt={enrollment.expiresAt}
                        accessDays={selectedDays}
                      />
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Duración del acceso (se aplica de inmediato desde hoy)
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ACCESS_DURATION_PRESETS.map((preset) => (
                            <Button
                              key={preset.label}
                              type="button"
                              variant={selectedDays === preset.days ? 'default' : 'outline'}
                              size="sm"
                              className="h-8 text-xs"
                              disabled={pendingKey !== null}
                              onClick={() =>
                                runAction(
                                  `${cardKey}-${preset.days ?? 'unlimited'}`,
                                  course.id,
                                  preset.days,
                                  () =>
                                    updateEnrollmentDuration(
                                      student.id,
                                      course.id,
                                      preset.days
                                    )
                                )
                              }
                            >
                              {pendingKey === `${cardKey}-${preset.days ?? 'unlimited'}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                preset.label
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={pendingKey !== null}
                          onClick={() =>
                            runAction(`${cardKey}-revoke`, course.id, null, () =>
                              revokeEnrollment(student.id, course.id)
                            )
                          }
                        >
                          {pendingKey === `${cardKey}-revoke` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
                              Quitar acceso
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {enrollment && !isActive && (
                    <div className="mt-4 space-y-4">
                      <EnrollmentAccessSummary expiresAt={enrollment.expiresAt} />
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Duración del acceso
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ACCESS_DURATION_PRESETS.map((preset) => (
                            <Button
                              key={preset.label}
                              type="button"
                              variant={selectedDays === preset.days ? 'default' : 'outline'}
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                setDurationDaysByCourse((prev) => ({
                                  ...prev,
                                  [course.id]: preset.days,
                                }))
                              }
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={pendingKey !== null}
                        onClick={() =>
                          runAction(`${cardKey}-renew`, course.id, selectedDays ?? null, () =>
                            grantEnrollment(student.id, course.id, selectedDays ?? null)
                          )
                        }
                      >
                        {pendingKey === `${cardKey}-renew` ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          'Renovar acceso'
                        )}
                      </Button>
                    </div>
                  )}

                  {!enrollment && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Duración del acceso
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ACCESS_DURATION_PRESETS.map((preset) => (
                            <Button
                              key={preset.label}
                              type="button"
                              variant={selectedDays === preset.days ? 'default' : 'outline'}
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                setDurationDaysByCourse((prev) => ({
                                  ...prev,
                                  [course.id]: preset.days,
                                }))
                              }
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={pendingKey !== null}
                        onClick={() =>
                          runAction(`${cardKey}-grant`, course.id, selectedDays ?? null, () =>
                            grantEnrollment(student.id, course.id, selectedDays ?? null)
                          )
                        }
                      >
                        {pendingKey === `${cardKey}-grant` ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Concediendo...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Conceder acceso
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
