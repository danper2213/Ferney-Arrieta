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
import { Textarea } from '@/components/ui/textarea';
import { deleteLesson, removeLessonVideo, type CourseMutationState, updateLesson } from './actions';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type LessonActionsProps = {
  lessonId: string;
  title: string;
  description: string;
  daysToUnlock: number;
  videoEmbedUrl?: string | null;
};

export function LessonActions({
  lessonId,
  title,
  description,
  daysToUnlock,
  videoEmbedUrl,
}: LessonActionsProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [openDeleteVideo, setOpenDeleteVideo] = useState(false);
  const [isDeleting, startDeleting] = useTransition();
  const [isDeletingVideo, startDeletingVideo] = useTransition();
  const [editState, editAction] = useActionState<CourseMutationState, FormData>(
    updateLesson.bind(null, lessonId),
    {}
  );

  useEffect(() => {
    if (editState.success) {
      toast.success('Seccion actualizada');
      setOpenEdit(false);
    } else if (editState.error) {
      toast.error(editState.error);
    }
  }, [editState]);

  const onDelete = () => {
    startDeleting(async () => {
      const result = await deleteLesson(lessonId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Seccion eliminada');
      setOpenDelete(false);
    });
  };

  const onDeleteVideo = () => {
    startDeletingVideo(async () => {
      const result = await removeLessonVideo(lessonId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Video eliminado');
      setOpenDeleteVideo(false);
      setOpenPreview(false);
    });
  };

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Acciones de seccion</span>
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
            Editar seccion
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!videoEmbedUrl}
            onSelect={(e) => {
              e.preventDefault();
              if (videoEmbedUrl) setOpenPreview(true);
            }}
          >
            <span className="mr-2 inline-block h-4 w-4 text-center">▶</span>
            Ver video
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!videoEmbedUrl}
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              if (videoEmbedUrl) setOpenDeleteVideo(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar video
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setOpenDelete(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar seccion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista previa del video</DialogTitle>
            <DialogDescription>
              Esta es la previsualizacion del video subido para esta seccion.
            </DialogDescription>
          </DialogHeader>
          {videoEmbedUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={videoEmbedUrl}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Esta seccion aun no tiene video subido.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openDeleteVideo} onOpenChange={setOpenDeleteVideo}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar video</DialogTitle>
            <DialogDescription>
              Se eliminará el video de esta lección y también de Bunny. Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenDeleteVideo(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onDeleteVideo}
              disabled={isDeletingVideo}
            >
              {isDeletingVideo ? 'Eliminando...' : 'Eliminar video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <form action={editAction} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Editar seccion</DialogTitle>
              <DialogDescription>Actualiza los datos de la leccion.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor={`lesson-title-${lessonId}`}>Titulo</Label>
              <Input
                id={`lesson-title-${lessonId}`}
                name="title"
                defaultValue={title}
                minLength={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lesson-description-${lessonId}`}>Descripcion</Label>
              <Textarea
                id={`lesson-description-${lessonId}`}
                name="description"
                defaultValue={description}
                className="min-h-[110px]"
                minLength={10}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lesson-days-${lessonId}`}>Dias para desbloquear</Label>
              <Input
                id={`lesson-days-${lessonId}`}
                name="days_to_unlock"
                type="number"
                min="0"
                defaultValue={String(daysToUnlock)}
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
            <DialogTitle>Eliminar seccion</DialogTitle>
            <DialogDescription>
              Esta accion elimina la leccion de forma permanente. No se puede deshacer.
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
