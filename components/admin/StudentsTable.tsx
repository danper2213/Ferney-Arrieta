'use client';

import { useState, useMemo } from 'react';
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
import type { StudentRow, CourseOption } from '@/app/(admin)/admin/students/page';
import { deleteStudent } from '@/app/(admin)/admin/students/actions';
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
  const [manageUserId, setManageUserId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        (s.email?.toLowerCase().includes(q) ?? false) ||
        (s.displayName?.toLowerCase().includes(q) ?? false)
    );
  }, [students, search]);

  const handleCloseManage = () => {
    setManageUserId(null);
    router.refresh();
  };

  const studentToManage = manageUserId
    ? students.find((s) => s.id === manageUserId)
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
            {students.length === 0
              ? 'No se encontraron estudiantes.'
              : 'Ningún alumno coincide con la búsqueda.'}
          </p>
          {students.length === 0 && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Comprueba que hayas iniciado sesión como <strong>master</strong>, que la migración de RLS en <code className="text-xs bg-muted px-1 rounded">profiles</code> esté aplicada (el master debe poder leer todos los perfiles) y que existan usuarios con rol <code className="text-xs bg-muted px-1 rounded">student</code> en la tabla profiles.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead>Cursos Activos</TableHead>
                <TableHead className="min-w-[240px] w-[1%] whitespace-nowrap text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={undefined} alt="" />
                        <AvatarFallback className="text-xs bg-muted">
                          {(student.displayName ?? student.email ?? 'U').slice(0, 1).toUpperCase()}
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
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(student.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.enrolledCourseIds.length === 0 ? (
                        <span className="text-muted-foreground text-sm">Sin acceso</span>
                      ) : (
                        student.enrolledCourseIds.map((courseId) => (
                          <Badge key={courseId} variant="secondary" className="text-xs">
                            {courseTitlesById[courseId] ?? courseId}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 shrink-0"
                        onClick={() => setManageUserId(student.id)}
                      >
                        <UserCog className="h-3.5 w-3.5" />
                        Gestionar Acceso
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
              ))}
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
          enrolledCourseIds={studentToManage.enrolledCourseIds}
        />
      )}

      <AlertDialog open={studentToDelete !== null} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar estudiante?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitarán todas las inscripciones, comentarios y progreso asociados a{' '}
              <span className="font-medium text-foreground">
                {studentToDelete?.displayName ?? studentToDelete?.email ?? 'este alumno'}
              </span>
              . El perfil dejará de aparecer en la lista. La cuenta en autenticación puede seguir existiendo en
              Supabase hasta que la elimines desde el panel de Auth si lo necesitas.
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
