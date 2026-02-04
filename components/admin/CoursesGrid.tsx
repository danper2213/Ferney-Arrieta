'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, BookOpen, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteCourse } from '@/app/actions/admin/courses';

export type CourseItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
};

export function CoursesGrid({ courses }: { courses: CourseItem[] }) {
  const router = useRouter();
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; thumbnail_url: string | null } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteCourse(courseToDelete.id, courseToDelete.thumbnail_url ?? '');
      if ((result as any).error) {
        toast.error((result as any).error);
        return;
      }
      toast.success('Curso eliminado correctamente');
      setCourseToDelete(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/90 text-slate-700 shadow-md hover:bg-white hover:text-slate-900 border border-white/50 dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-600/50 dark:hover:bg-slate-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Opciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/courses/${course.id}`} className="flex items-center gap-2 cursor-pointer">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => {
                        e.preventDefault();
                        setCourseToDelete({ id: course.id, thumbnail_url: course.thumbnail_url });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Borrar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl">{course.title}</CardTitle>
                {course.is_published ? (
                  <Badge variant="default" className="shrink-0">
                    Publicado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0">
                    Borrador
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/admin/courses/${course.id}`}>
                <Button className="w-full" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Contenido
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={courseToDelete !== null} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se borrará permanentemente el curso y todo su contenido (módulos,
              lecciones, videos, inscripciones).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar curso'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
