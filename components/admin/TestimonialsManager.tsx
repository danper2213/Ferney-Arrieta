'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  deleteTestimonial,
  saveTestimonial,
  type TestimonialActionResult,
} from '@/app/actions/admin/testimonials';
import { BunnyDirectUploader } from '@/components/admin/BunnyDirectUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pencil, Plus, Trash2 } from 'lucide-react';

export type TestimonialRow = {
  id: string;
  person_name: string;
  country: string;
  description: string | null;
  video_provider_id: string;
  is_active: boolean;
  order_index: number;
};

function TestimonialForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: TestimonialRow | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [videoProviderId, setVideoProviderId] = useState(
    initial?.video_provider_id ?? '',
  );
  const [state, formAction, isPending] = useActionState<
    TestimonialActionResult | null,
    FormData
  >(saveTestimonial, null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) {
      toast.success(initial ? 'Testimonio actualizado' : 'Testimonio creado');
      onSaved();
      router.refresh();
    }
  }, [state, initial, onSaved, router]);

  const videoTitle = initial
    ? `Testimonio - ${initial.person_name}`
    : 'Nuevo testimonio';

  return (
    <form action={formAction} className="space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="video_provider_id" value={videoProviderId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="person_name">Nombre del estudiante</Label>
          <Input
            id="person_name"
            name="person_name"
            defaultValue={initial?.person_name ?? ''}
            placeholder="Ej. Juan Pérez"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            name="country"
            defaultValue={initial?.country ?? ''}
            placeholder="Ej. Colombia"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initial?.description ?? ''}
          placeholder="Resume la experiencia del estudiante con el curso..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Video del testimonio</Label>
        <BunnyDirectUploader
          videoTitle={videoTitle}
          currentVideoId={initial?.video_provider_id}
          onUploaded={setVideoProviderId}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending || !videoProviderId}>
          {isPending
            ? 'Guardando...'
            : initial
              ? 'Guardar cambios'
              : 'Crear testimonio'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function TestimonialsManager({
  testimonials,
}: {
  testimonials: TestimonialRow[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [creating, setCreating] = useState(false);

  const showForm = creating || editing !== null;

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar el testimonio de ${name}?`)) return;
    const result = await deleteTestimonial(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success('Testimonio eliminado');
      if (editing?.id === id) setEditing(null);
      router.refresh();
    }
  }

  function handleSaved() {
    setCreating(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      {!showForm && (
        <div className="flex justify-end">
          <Button type="button" onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo testimonio
          </Button>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editing ? 'Editar testimonio' : 'Nuevo testimonio'}
            </CardTitle>
            <CardDescription>
              Sube el video del estudiante y completa sus datos. Ideal: 60–90 segundos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestimonialForm
              key={editing?.id ?? 'new'}
              initial={editing}
              onCancel={() => {
                setCreating(false);
                setEditing(null);
              }}
              onSaved={handleSaved}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Testimonios</CardTitle>
          <CardDescription>
            {testimonials.length === 0
              ? 'Aún no hay testimonios publicados.'
              : `${testimonials.length} testimonio(s) en la landing.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {testimonials.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Crea el primer testimonio con el botón de arriba.
            </p>
          ) : (
            testimonials.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">{item.person_name}</p>
                  <p className="text-sm text-muted-foreground">{item.country}</p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCreating(false);
                      setEditing(item);
                    }}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id, item.person_name)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
