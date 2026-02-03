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
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { createModule, type CreateModuleState } from './actions';

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
        'Crear Módulo'
      )}
    </Button>
  );
}

export function AddModuleDialog({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false);
  const initialState: CreateModuleState = {};
  const [state, formAction] = useActionState(
    createModule.bind(null, courseId),
    initialState
  );

  // Cerrar el diálogo cuando se crea exitosamente
  if (state.success && open) {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-5 w-5" />
          Agregar Módulo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Módulo</DialogTitle>
            <DialogDescription>
              Agrega un nuevo módulo al curso. Los módulos organizan las lecciones por temas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título del Módulo</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Introducción al curso"
                required
                minLength={3}
              />
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
