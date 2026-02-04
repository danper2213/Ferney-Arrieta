import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, BookOpen, MessageSquare, UserPlus, MessageCircle } from 'lucide-react';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalAlumnos },
    { count: cursosActivos },
    { count: comentariosTotales },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
  ]);

  const { data: ultimosInscritosRaw = [] } = await supabase
    .from('enrollments')
    .select('user_id, course_id, created_at, profiles(display_name), courses(title)')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: ultimosComentariosRaw = [] } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      lesson_id,
      profiles(display_name),
      lessons(
        id,
        title,
        modules(courses(slug))
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const ultimosInscritos = ((ultimosInscritosRaw ?? []) as unknown) as Array<{
    user_id: string;
    course_id: string;
    created_at: string;
    profiles: { display_name: string | null } | null;
    courses: { title: string } | null;
  }>;

  type CommentRow = {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    lesson_id: string;
    profiles: { display_name: string | null } | null;
    lessons: {
      id: string;
      title: string;
      modules: { courses: { slug: string } | null } | null;
    } | null;
  };

  const ultimosComentarios = ((ultimosComentariosRaw ?? []) as unknown) as CommentRow[];
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-1">
          Panel de Control
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base capitalize">
          {today}
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Alumnos
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalAlumnos ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cursos Activos
            </CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cursosActivos ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interacciones / Comentarios
            </CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{comentariosTotales ?? 0}</p>
          </CardContent>
        </Card>
      </section>

      {/* Actividad reciente: 2 columnas */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Últimos Alumnos Inscritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ultimosInscritos.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">
                No hay inscripciones recientes.
              </p>
            ) : (
              <div className="space-y-3">
                {ultimosInscritos.map((row) => (
                  <div
                    key={`${row.user_id}-${row.course_id}-${row.created_at}`}
                    className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={undefined} alt="" />
                      <AvatarFallback className="text-xs bg-muted">
                        {(row.profiles?.display_name ?? 'U').slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {row.profiles?.display_name ?? 'Sin nombre'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {row.courses?.title ?? 'Curso'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(row.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ultimosComentarios.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">
                No hay comentarios recientes.
              </p>
            ) : (
              <ul className="space-y-3">
                {ultimosComentarios.map((c) => {
                  const slug = c.lessons?.modules?.courses?.slug ?? '';
                  const href = slug ? `/course/${slug}/lesson/${c.lesson_id}` : '#';
                  return (
                    <li key={c.id}>
                      <Link
                        href={href}
                        className="flex gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={undefined} alt="" />
                          <AvatarFallback className="text-xs bg-muted">
                            {(c.profiles?.display_name ?? 'U').slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-muted-foreground truncate">
                            {c.profiles?.display_name ?? 'Usuario'}
                          </p>
                          <p className="text-sm truncate line-clamp-2">{c.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(c.created_at)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
