'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Video } from 'lucide-react';
import { createLesson, type CreateLessonState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creando...
        </>
      ) : (
        'Crear Lección'
      )}
    </Button>
  );
}

export function AddLessonDialog({ moduleId }: { moduleId: string }) {
  const [open, setOpen] = useState(false);
  const initialState: CreateLessonState = {};
  const [state, formAction] = useActionState(
    createLesson.bind(null, moduleId),
    initialState
  );

  // Cerrar el diálogo cuando se crea exitosamente
  if (state.success && open) {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Lección
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Crear Nueva Lección</DialogTitle>
            <DialogDescription>
              Agrega una nueva lección a este módulo. Podrás subir el video más adelante.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título de la Lección</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Configuración del entorno"
                required
                minLength={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe el contenido de esta lección..."
                className="min-h-[100px]"
                required
                minLength={10}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="days_to_unlock">Días para Desbloquear</Label>
              <Input
                id="days_to_unlock"
                name="days_to_unlock"
                type="number"
                min="0"
                defaultValue="0"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Número de días después de la inscripción para que esta lección se desbloquee (0 =
                inmediato)
              </p>
            </div>

            <div className="border-2 border-dashed rounded-lg p-4 bg-muted/50">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Video className="h-8 w-8" />
                <div>
                  <p className="text-sm font-medium">Video Upload Pending</p>
                  <p className="text-xs">La funcionalidad de subida de video se agregará próximamente</p>
                </div>
              </div>
            </div>

            {state.error && (
              <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm">
                {state.error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
