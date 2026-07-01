'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { updateCourseProgramContent } from '@/app/(admin)/admin/courses/[courseId]/course-program-content-actions';
import {
  MAX_PROGRAM_CONTENT_LENGTH,
  normalizeProgramContent,
} from '@/lib/course-program-content';
import { GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type CourseProgramContentFormProps = {
  courseId: string;
  initialContent: string;
};

export function CourseProgramContentForm({
  courseId,
  initialContent,
}: CourseProgramContentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [showPreview, setShowPreview] = useState(false);
  const [isPending, startTransition] = useTransition();
  const hasSavedContent = Boolean(normalizeProgramContent(initialContent));

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const normalizedCurrent = normalizeProgramContent(content);
  const normalizedInitial = normalizeProgramContent(initialContent);
  const hasChanges = normalizedCurrent !== normalizedInitial;
  const charsLeft = MAX_PROGRAM_CONTENT_LENGTH - content.length;

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCourseProgramContent(courseId, content);
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Contenido del programa guardado');
      router.refresh();
    });
  };

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={hasSavedContent ? undefined : 'program-content'}
      className="mb-6 rounded-lg border"
    >
      <AccordionItem value="program-content" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
          <div className="flex items-start gap-3 text-left">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 space-y-1">
              <p className="text-base font-semibold leading-none">Contenido «¿Qué aprenderás?»</p>
              <p className="text-sm font-normal text-muted-foreground">
                {hasSavedContent
                  ? 'Contenido guardado. La descripción del curso va en la tarjeta; esto se abre con el botón animado.'
                  : 'La descripción del curso se muestra en la tarjeta. Aquí va el texto del botón «¿Qué aprenderás?».'}
              </p>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-4 pb-4 sm:px-5">
          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Label htmlFor={`program-content-${courseId}`}>Texto del programa</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 self-start text-xs"
                  onClick={() => setShowPreview((value) => !value)}
                  disabled={!normalizedCurrent}
                >
                  {showPreview ? 'Ocultar vista previa' : 'Vista previa'}
                </Button>
              </div>
              <Textarea
                id={`program-content-${courseId}`}
                value={content}
                onChange={(event) =>
                  setContent(event.target.value.slice(0, MAX_PROGRAM_CONTENT_LENGTH))
                }
                placeholder="Pega aquí todo el contenido que verán al pulsar «¿Qué aprenderás?»..."
                className="min-h-[320px] resize-y font-normal leading-relaxed"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">{charsLeft} caracteres restantes</p>
            </div>

            <div className="flex justify-end">
              <Button type="button" disabled={isPending || !hasChanges} onClick={handleSave}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar contenido'
                )}
              </Button>
            </div>

            {showPreview && normalizedCurrent && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-950 p-5">
                <p className="mb-3 text-sm font-semibold text-white">¿Qué aprenderás?</p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
                  {normalizedCurrent}
                </p>
              </div>
            )}

            {hasSavedContent && (
              <p
                className={cn(
                  'rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground',
                  'border border-dashed'
                )}
              >
                Puedes colapsar esta sección con el acordeón cuando termines de editar.
              </p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
