import { createClient } from '@/lib/supabase/server';
import { StudentsTable } from '@/components/admin/StudentsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { isEnrollmentActive } from '@/lib/enrollment-access';
import {
  ENROLLMENT_EXPIRY_MIGRATION_HINT,
  isMissingColumnError,
} from '@/lib/supabase/schema-fallback';
import type { CourseOption, StudentEnrollment, StudentRow } from '@/lib/admin/students-types';

export type { CourseOption, StudentEnrollment, StudentRow };

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
  let enrollments: {
    user_id: string;
    course_id: string;
    created_at: string;
    expires_at: string | null;
  }[] = [];

  if (userIds.length > 0) {
    const { data: enrollmentsRaw, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('user_id, course_id, created_at, expires_at')
      .in('user_id', userIds);

    if (enrollmentsError) {
      if (!isMissingColumnError(enrollmentsError)) {
        console.error('Error al obtener inscripciones:', enrollmentsError.message);
      }
      const { data: enrollmentsFallback } = await supabase
        .from('enrollments')
        .select('user_id, course_id, created_at')
        .in('user_id', userIds);
      enrollments = (enrollmentsFallback ?? []).map((e) => ({
        ...(e as { user_id: string; course_id: string; created_at: string }),
        expires_at: null,
      }));
    } else {
      enrollments = (enrollmentsRaw ?? []) as typeof enrollments;
    }
  }

  let coursesLoadWarning: string | null = null;
  let courses: CourseOption[] = [];
  const { data: coursesRaw, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, default_access_days')
    .order('title');

  if (coursesError) {
    if (!isMissingColumnError(coursesError)) {
      console.error('Error al obtener cursos:', coursesError.message);
    }
    coursesLoadWarning = ENROLLMENT_EXPIRY_MIGRATION_HINT;
    const { data: coursesFallback } = await supabase
      .from('courses')
      .select('id, title')
      .order('title');
    courses = (Array.isArray(coursesFallback) ? coursesFallback : []).map((c) => ({
      id: c.id,
      title: c.title,
      defaultAccessDays: null,
    }));
  } else {
    courses = (Array.isArray(coursesRaw) ? coursesRaw : []).map((c) => ({
      id: c.id,
      title: c.title,
      defaultAccessDays: (c as { default_access_days?: number | null }).default_access_days ?? null,
    }));
  }

  const enrollmentsByUser = new Map<string, StudentEnrollment[]>();
  for (const e of enrollments) {
    if (!enrollmentsByUser.has(e.user_id)) {
      enrollmentsByUser.set(e.user_id, []);
    }
    enrollmentsByUser.get(e.user_id)!.push({
      courseId: e.course_id,
      createdAt: e.created_at,
      expiresAt: e.expires_at ?? null,
    });
  }

  const courseTitlesById = Object.fromEntries(courses.map((c) => [c.id, c.title]));

  const students: StudentRow[] = profiles.map((p) => ({
    id: p.id,
    displayName: p.display_name,
    email: null,
    createdAt: p.created_at,
    enrollments: enrollmentsByUser.get(p.id) ?? [],
  }));

  const totalActiveAccess = students.reduce(
    (acc, s) => acc + s.enrollments.filter((e) => isEnrollmentActive(e.expiresAt)).length,
    0
  );
  const expiringSoonCount = students.reduce(
    (acc, s) =>
      acc +
      s.enrollments.filter((e) => {
        if (!isEnrollmentActive(e.expiresAt) || !e.expiresAt) return false;
        const days = Math.ceil(
          (new Date(e.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return days > 0 && days <= 30;
      }).length,
    0
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-6xl">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-9 w-9 sm:h-10 sm:w-10" />
          Gestión de Estudiantes
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Administra alumnos, duración de acceso y renovaciones por curso
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{students.length}</p>
            <p className="text-sm text-muted-foreground">Estudiantes registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{totalActiveAccess}</p>
            <p className="text-sm text-muted-foreground">Accesos activos a cursos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-amber-600">{expiringSoonCount}</p>
            <p className="text-sm text-muted-foreground">Accesos por vencer (30 días)</p>
          </CardContent>
        </Card>
      </div>

      {coursesLoadWarning && (
        <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {coursesLoadWarning}
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Estudiantes</CardTitle>
          <CardDescription>
            Revisa el tiempo restante de cada curso y gestiona accesos con duración personalizada.
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
              courseTitlesById={courseTitlesById}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
