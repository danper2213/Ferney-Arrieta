import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TestimonialsManager } from '@/components/admin/TestimonialsManager';

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?error=Inicia sesión para acceder');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if ((profile as { role?: string } | null)?.role !== 'master') {
    redirect('/dashboard');
  }

  const { data: testimonials = [], error } = await supabase
    .from('testimonials')
    .select('id, person_name, country, description, video_provider_id, is_active, order_index')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al cargar testimonios:', error);
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Testimonios</h1>
        <p className="mt-1 text-muted-foreground">
          Sube videos de estudiantes y gestiona los testimonios de la landing.
        </p>
      </div>

      <TestimonialsManager
        testimonials={(testimonials ?? []) as Parameters<
          typeof TestimonialsManager
        >[0]['testimonials']}
      />
    </div>
  );
}
