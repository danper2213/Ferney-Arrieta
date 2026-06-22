'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  updateCourseDefaultAccessDays,
} from '@/app/(admin)/admin/courses/[courseId]/course-access-settings';
import { ACCESS_DURATION_PRESETS, resolveDefaultAccessDays } from '@/lib/enrollment-access';
import { Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type CourseDefaultAccessFormProps = {
  courseId: string;
  defaultAccessDays: number | null;
};

export function CourseDefaultAccessForm({
  courseId,
  defaultAccessDays,
}: CourseDefaultAccessFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(
    defaultAccessDays ?? resolveDefaultAccessDays(null)
  );
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCourseDefaultAccessDays(courseId, selected);
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Duración de acceso actualizada');
      router.refresh();
    });
  };

  const hasChanges = selected !== (defaultAccessDays ?? resolveDefaultAccessDays(null));

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Duración de acceso por defecto
        </CardTitle>
        <CardDescription>
          Se aplicará al conceder acceso a nuevos estudiantes en este curso. Puedes cambiarla por
          alumno al gestionar accesos.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        {ACCESS_DURATION_PRESETS.filter((p) => p.days != null).map((preset) => (
          <Button
            key={preset.label}
            type="button"
            size="sm"
            variant={selected === preset.days ? 'default' : 'outline'}
            disabled={isPending}
            onClick={() => setSelected(preset.days)}
          >
            {preset.label}
          </Button>
        ))}
        {hasChanges && (
          <Button type="button" size="sm" disabled={isPending} onClick={handleSave} className="ml-auto">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
