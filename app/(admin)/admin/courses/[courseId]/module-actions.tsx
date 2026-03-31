'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteModule, type CourseMutationState, updateModule } from './actions';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ModuleActionsProps = {
  moduleId: string;
  title: string;
};

export function ModuleActions({ moduleId, title }: ModuleActionsProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [isDeleting, startDeleting] = useTransition();
  const [editState, editAction] = useActionState<CourseMutationState, FormData>(
    updateModule.bind(null, moduleId),
    {}
  );

  useEffect(() => {
    if (editState.success) {
      toast.success('Modulo actualizado');
      setOpenEdit(false);
    } else if (editState.error) {
      toast.error(editState.error);
    }
  }, [editState]);

  const onDelete = () => {
    startDeleting(async () => {
      const result = await deleteModule(moduleId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Modulo eliminado');
      setOpenDelete(false);
    });
  };

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Acciones del modulo</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpenEdit(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar modulo
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setOpenDelete(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar modulo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <form action={editAction} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Editar modulo</DialogTitle>
              <DialogDescription>Actualiza el nombre de este modulo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor={`module-title-${moduleId}`}>Titulo</Label>
              <Input
                id={`module-title-${moduleId}`}
                name="title"
                defaultValue={title}
                minLength={3}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar modulo</DialogTitle>
            <DialogDescription>
              Esta accion elimina el modulo y todas sus lecciones. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
