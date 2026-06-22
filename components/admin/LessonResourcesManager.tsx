'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  deleteLessonResource,
  registerLessonResource,
} from '@/app/(admin)/admin/courses/[courseId]/resource-actions';
import { createClient } from '@/lib/supabase/client';
import {
  buildLessonResourceStoragePath,
  formatResourceSize,
  getResourceTypeFromMime,
  getResourceTypeLabel,
  isAllowedResourceFile,
  LESSON_RESOURCES_BUCKET,
  MAX_RESOURCE_SIZE_BYTES,
  type LessonResource,
} from '@/lib/lesson-resources';
import { FileAudio, FileImage, FileText, Loader2, Paperclip, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

type LessonResourcesManagerProps = {
  lessonId: string;
  resources: LessonResource[];
};

function ResourceIcon({ type }: { type: LessonResource['resource_type'] }) {
  switch (type) {
    case 'pdf':
      return <FileText className="h-4 w-4 text-red-500" />;
    case 'audio':
      return <FileAudio className="h-4 w-4 text-blue-500" />;
    case 'image':
      return <FileImage className="h-4 w-4 text-emerald-500" />;
  }
}

export function LessonResourcesManager({ lessonId, resources }: LessonResourcesManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startDelete] = useTransition();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    let uploadedCount = 0;

    for (const file of Array.from(files)) {
      if (file.size === 0) {
        toast.error(`El archivo "${file.name}" está vacío`);
        continue;
      }

      if (file.size > MAX_RESOURCE_SIZE_BYTES) {
        toast.error(`"${file.name}" supera el límite de 50 MB`);
        continue;
      }

      if (!isAllowedResourceFile(file)) {
        toast.error(`"${file.name}" no es un PDF, audio o imagen compatible`);
        continue;
      }

      const resourceType = getResourceTypeFromMime(file.type);
      if (!resourceType) continue;

      const resourceId = crypto.randomUUID();
      const storagePath = buildLessonResourceStoragePath(lessonId, resourceId, file.name);

      const { error: uploadError } = await supabase.storage
        .from(LESSON_RESOURCES_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Lesson resource upload error:', uploadError);
        toast.error(
          `No se pudo subir "${file.name}". Comprueba que el bucket "${LESSON_RESOURCES_BUCKET}" exista.`
        );
        continue;
      }

      const registerResult = await registerLessonResource({
        resourceId,
        lessonId,
        fileName: file.name,
        storagePath,
        mimeType: file.type,
        resourceType,
        fileSize: file.size,
      });

      if (registerResult.error) {
        await supabase.storage.from(LESSON_RESOURCES_BUCKET).remove([storagePath]);
        toast.error(registerResult.error);
        continue;
      }

      uploadedCount += 1;
    }

    setUploading(false);
    e.target.value = '';

    if (uploadedCount > 0) {
      toast.success(
        uploadedCount === 1
          ? 'Recurso subido correctamente'
          : `${uploadedCount} recursos subidos correctamente`
      );
      router.refresh();
    }
  };

  const handleDelete = (resourceId: string, title: string) => {
    startDelete(async () => {
      setDeletingId(resourceId);
      const result = await deleteLessonResource(resourceId);
      setDeletingId(null);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`"${title}" eliminado`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-border/70 bg-muted/15 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Paperclip className="h-4 w-4 shrink-0" />
            Recursos de apoyo
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF descargables, audios e imágenes para complementar la lección
          </p>
        </div>
        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,audio/*,image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2 sm:w-auto"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Subir recursos
              </>
            )}
          </Button>
        </div>
      </div>

      {resources.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Aún no hay recursos. Puedes subir varios archivos a la vez.
        </p>
      ) : (
        <ul className="space-y-2">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-2.5 sm:px-4"
            >
              <ResourceIcon type={resource.resource_type} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{resource.title}</p>
                <p className="text-xs text-muted-foreground">
                  {getResourceTypeLabel(resource.resource_type)} · {formatResourceSize(resource.file_size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                disabled={deletingId === resource.id}
                onClick={() => handleDelete(resource.id, resource.title)}
                aria-label={`Eliminar ${resource.title}`}
              >
                {deletingId === resource.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
