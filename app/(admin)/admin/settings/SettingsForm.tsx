'use client';

import { useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveSettings, type SaveSettingsResult } from '@/app/actions/admin/settings';
import { toast } from 'sonner';

type SettingRow = { key: string; value: string; label: string };

export function SettingsForm({ settings }: { settings: SettingRow[] }) {
  const [state, formAction, isPending] = useActionState(
    async (_: SaveSettingsResult | null, formData: FormData) => {
      return saveSettings(formData);
    },
    null
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) toast.success('Configuración guardada correctamente');
  }, [state]);

  if (settings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No hay configuraciones definidas. Crea registros en la tabla <code className="bg-muted px-1 rounded">app_settings</code> (key, value, label).
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="_keys" value={settings.map((s) => s.key).join(',')} />
      {settings.map((row) => (
        <div key={row.key} className="space-y-2">
          <Label htmlFor={row.key}>{row.label}</Label>
          <Input
            id={row.key}
            name={row.key}
            defaultValue={row.value ?? ''}
            placeholder={row.label}
            className="max-w-md"
          />
        </div>
      ))}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </form>
  );
}
