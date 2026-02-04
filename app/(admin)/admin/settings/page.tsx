import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from './SettingsForm';

export default async function AdminSettingsPage() {
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

  const role = (profile as { role?: string } | null)?.role;
  if (role !== 'master') {
    redirect('/dashboard');
  }

  const { data: settings = [], error } = await supabase
    .from('app_settings')
    .select('key, value, label')
    .order('key', { ascending: true });

  if (error) {
    console.error('Error al cargar configuración:', error);
  }

  const settingsList = (settings ?? []) as { key: string; value: string; label: string }[];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground mt-1">
          Configuración general de la aplicación
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>
            Edita los valores y guarda los cambios. Se aplican en toda la app (landing, WhatsApp, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settingsList} />
        </CardContent>
      </Card>
    </div>
  );
}
