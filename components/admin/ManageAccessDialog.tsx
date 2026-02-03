'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { manageEnrollment } from '@/app/actions/admin/enrollments';
import type { StudentRow, CourseOption } from '@/app/(admin)/admin/students/page';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type ManageAccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentRow;
  courses: CourseOption[];
  enrolledCourseIds: string[];
};

export function ManageAccessDialog({
  open,
  onOpenChange,
  student,
  courses,
  enrolledCourseIds,
}: ManageAccessDialogProps) {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set(enrolledCourseIds));
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setActiveIds(new Set(enrolledCourseIds));
    }
  }, [open, enrolledCourseIds]);

  const handleToggle = async (courseId: string, checked: boolean) => {
    const prev = new Set(activeIds);
    setActiveIds((s) => {
      const next = new Set(s);
      if (checked) next.add(courseId);
      else next.delete(courseId);
      return next;
    });
    setPendingCourseId(courseId);

    const action = checked ? 'grant' : 'revoke';
    const result = await manageEnrollment(student.id, courseId, action);
    setPendingCourseId(null);

    if (result?.error) {
      setActiveIds(prev);
      toast.error(result.error);
      return;
    }
    toast.success(checked ? 'Acceso asignado' : 'Acceso quitado');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar acceso</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">
              {student.displayName ?? student.email ?? 'Estudiante'}
            </span>
            {' — Marca o desmarca los cursos a los que tiene acceso. Los cambios se aplican al instante.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2 max-h-[60vh] overflow-y-auto">
          {courses.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No hay cursos disponibles.</p>
          ) : (
            courses.map((course) => {
              const isPendingThis = pendingCourseId === course.id;
              return (
                <div
                  key={course.id}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`${student.id}-${course.id}`}
                    checked={activeIds.has(course.id)}
                    disabled={isPendingThis}
                    onCheckedChange={(checked) =>
                      handleToggle(course.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`${student.id}-${course.id}`}
                    className="flex-1 cursor-pointer text-sm font-medium"
                  >
                    {course.title}
                  </Label>
                  {isPendingThis && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
