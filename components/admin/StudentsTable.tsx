'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ManageAccessDialog } from './ManageAccessDialog';
import { StudentCourseAccessChip } from './StudentCourseAccessChip';
import type { StudentRow, CourseOption } from '@/lib/admin/students-types';
import { deleteStudent } from '@/app/(admin)/admin/students/actions';
import { isEnrollmentActive } from '@/lib/enrollment-access';
import { Search, Trash2, UserCog } from 'lucide-react';
import { toast } from 'sonner';

type StudentsTableProps = {
  students: StudentRow[];
  courses: CourseOption[];
  courseTitlesById: Record<string, string>;
};

export function StudentsTable({
  students,
  courses,
  courseTitlesById,
}: StudentsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [studentsState, setStudentsState] = useState(students);
  const [manageUserId, setManageUserId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!manageUserId) {
      setStudentsState(students);
    }
  }, [students, manageUserId]);

  const handleEnrollmentChange = useCallback(
    (
      userId: string,
      courseId: string,
      update: { expiresAt: string | null; removed?: boolean; createdAt?: string }
    ) => {
      setStudentsState((prev) =>
        prev.map((s) => {
          if (s.id !== userId) return s;
          if (update.removed) {
            return {
              ...s,
              enrollments: s.enrollments.filter((e) => e.courseId !== courseId),
            };
          }
          const exists = s.enrollments.some((e) => e.courseId === courseId);
          if (exists) {
            return {
              ...s,
              enrollments: s.enrollments.map((e) =>
                e.courseId === courseId ? { ...e, expiresAt: update.expiresAt } : e
              ),
            };
          }
          return {
            ...s,
            enrollments: [
              ...s.enrollments,
              {
                courseId,
                expiresAt: update.expiresAt,
                createdAt: update.createdAt ?? new Date().toISOString(),
              },
            ],
          };
        })
      );
    },
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return studentsState;
    return studentsState.filter(
      (s) =>
        (s.email?.toLowerCase().includes(q) ?? false) ||
        (s.displayName?.toLowerCase().includes(q) ?? false)
    );
  }, [studentsState, search]);

  const handleCloseManage = () => {
    setManageUserId(null);
    router.refresh();
  };

  const studentToManage = manageUserId
    ? studentsState.find((s) => s.id === manageUserId) ??
      students.find((s) => s.id === manageUserId)
    : null;

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteStudent(studentToDelete.id);
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Estudiante eliminado del panel');
      setStudentToDelete(null);
      setManageUserId(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          type="search"
          placeholder="Buscar por email o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-muted bg-muted/30 p-6 text-center space-y-2">
          <p className="text-muted-foreground font-medium">
            {studentsState.length === 0
              ? 'No se encontraron estudiantes.'
              : 'Ningún alumno coincide con la búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Estudiante</TableHead>
                <TableHead className="whitespace-nowrap">Registro</TableHead>
                <TableHead className="min-w-[280px]">Acceso a cursos</TableHead>
                <TableHead className="min-w-[160px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => {
                const activeEnrollments = student.enrollments.filter((e) =>
                  isEnrollmentActive(e.expiresAt)
                );
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={undefined} alt="" />
                          <AvatarFallback className="text-xs bg-muted">
                            {(student.displayName ?? student.email ?? 'U')
                              .slice(0, 1)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {student.displayName ?? 'Sin nombre'}
                          </p>
                          {student.email && (
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(student.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      {student.enrollments.length === 0 ? (
                        <span className="text-sm text-muted-foreground">Sin acceso</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {student.enrollments.map((enrollment) => (
                            <StudentCourseAccessChip
                              key={enrollment.courseId}
                              courseTitle={
                                courseTitlesById[enrollment.courseId] ?? enrollment.courseId
                              }
                              expiresAt={enrollment.expiresAt}
                            />
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="gap-1.5 shrink-0"
                          onClick={() => setManageUserId(student.id)}
                        >
                          <UserCog className="h-3.5 w-3.5" />
                          Gestionar
                          {activeEnrollments.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-0.5 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                            >
                              {activeEnrollments.length}
                            </Badge>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => setStudentToDelete(student)}
                          title="Eliminar estudiante"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Eliminar estudiante</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {studentToManage && (
        <ManageAccessDialog
          open={!!manageUserId}
          onOpenChange={(open) => !open && handleCloseManage()}
          student={studentToManage}
          courses={courses}
          onEnrollmentChange={handleEnrollmentChange}
        />
      )}

      <AlertDialog
        open={studentToDelete !== null}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar estudiante?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitarán todas las inscripciones, comentarios y progreso asociados a{' '}
              <span className="font-medium text-foreground">
                {studentToDelete?.displayName ?? studentToDelete?.email ?? 'este alumno'}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" disabled={isDeleting} onClick={handleConfirmDelete}>
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
