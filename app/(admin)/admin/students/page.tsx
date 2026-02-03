import { createClient } from '@/lib/supabase/server';
import { StudentsTable } from '@/components/admin/StudentsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export type StudentRow = {
  id: string;
  displayName: string | null;
  email: string | null;
  createdAt: string;
  enrolledCourseIds: string[];
};

export type CourseOption = {
  id: string;
  title: string;
};

export default async function StudentsPage() {
  const supabase = await createClient();

  const {
    data: profilesRaw,
    error: profilesError,
  } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  if (profilesError) {
    const errMsg = String(profilesError.message ?? '');
    const errCode = String(profilesError.code ?? '');
    const errDetails = String(profilesError.details ?? '');
    console.error(
      'Error al obtener estudiantes:',
      errMsg || errCode || errDetails || 'Error desconocido',
      errCode ? `[${errCode}]` : '',
      errDetails || ''
    );
  }

  const profilesRawSafe = Array.isArray(profilesRaw) ? profilesRaw : [];
  const profiles = profilesRawSafe as {
    id: string;
    display_name: string | null;
    created_at: string;
  }[];

  const userIds = profiles.map((p) => p.id);
  let enrollments: { user_id: string; course_id: string }[] = [];
  if (userIds.length > 0) {
    const { data: enrollmentsRaw } = await supabase
      .from('enrollments')
      .select('user_id, course_id')
      .in('user_id', userIds);
    enrollments = (enrollmentsRaw ?? []) as { user_id: string; course_id: string }[];
  }

  const { data: coursesRaw = [] } = await supabase
    .from('courses')
    .select('id, title')
    .order('title');

  const courses: CourseOption[] = (coursesRaw as { id: string; title: string }[]).map(
    (c) => ({ id: c.id, title: c.title })
  );

  const enrollmentsByUser = new Map<string, Set<string>>();
  for (const e of enrollments) {
    if (!enrollmentsByUser.has(e.user_id)) {
      enrollmentsByUser.set(e.user_id, new Set());
    }
    enrollmentsByUser.get(e.user_id)!.add(e.course_id);
  }

  const courseTitlesById = new Map(courses.map((c) => [c.id, c.title]));

  const students: StudentRow[] = profiles.map((p) => ({
    id: p.id,
    displayName: p.display_name,
    email: null,
    createdAt: p.created_at,
    enrolledCourseIds: Array.from(enrollmentsByUser.get(p.id) ?? []),
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-6xl">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-9 w-9 sm:h-10 sm:w-10" />
          Gestión de Estudiantes
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Administra alumnos y sus accesos a los cursos
        </p>
      </header>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Estudiantes</CardTitle>
          <CardDescription>
            Lista de alumnos con rol estudiante. Usa &quot;Gestionar Accesos&quot; para asignar o quitar cursos.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {profilesError ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-medium">Error al cargar estudiantes</p>
              <p className="mt-1 text-muted-foreground">
                {profilesError.message ||
                  profilesError.details ||
                  profilesError.hint ||
                  'Revisa la consola del servidor o que la tabla profiles exista y tengas políticas RLS que permitan al master leer perfiles.'}
                {profilesError.code ? ` (código: ${profilesError.code})` : ''}
              </p>
            </div>
          ) : (
            <StudentsTable
              students={students}
              courses={courses}
              courseTitlesById={Object.fromEntries(courseTitlesById)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
