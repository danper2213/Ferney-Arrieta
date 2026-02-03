import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoursesGrid, type CourseItem } from '@/components/admin/CoursesGrid';
import { Plus } from 'lucide-react';

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, slug, description, thumbnail_url, is_published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener cursos:', error);
  }

  const courseList: CourseItem[] = (courses ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description ?? null,
    thumbnail_url: c.thumbnail_url ?? null,
    is_published: c.is_published ?? false,
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-6xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Gestión de Cursos</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Administra todos los cursos de la plataforma
          </p>
        </div>
        <Link href="/admin/courses/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear Curso
          </Button>
        </Link>
      </header>

      {!courseList.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Cursos Disponibles</CardTitle>
            <CardDescription>
              Lista de todos los cursos creados en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No hay cursos disponibles. Crea tu primer curso para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <CoursesGrid courses={courseList} />
      )}
    </div>
  );
}
