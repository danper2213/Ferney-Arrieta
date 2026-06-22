'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CourseMotivationalBanner } from '@/components/student/CourseMotivationalBanner';
import { updateLessonMotivationalMessage } from '@/app/(admin)/admin/courses/[courseId]/lesson-message-actions';
import { MAX_MOTIVATIONAL_MESSAGE_LENGTH } from '@/lib/course-motivational-message';
import { Loader2, MessageSquareQuote } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type LessonMotivationalMessageFormProps = {
  lessonId: string;
  lessonTitle: string;
  initialMessage: string | null;
  className?: string;
};

export function LessonMotivationalMessageForm({
  lessonId,
  lessonTitle,
  initialMessage,
  className,
}: LessonMotivationalMessageFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState(initialMessage ?? '');
  const [showPreview, setShowPreview] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMessage(initialMessage ?? '');
  }, [initialMessage]);

  const charsLeft = MAX_MOTIVATIONAL_MESSAGE_LENGTH - message.length;
  const hasChanges = message.trim() !== (initialMessage ?? '').trim();

  const handleChange = (value: string) => {
    setMessage(value.slice(0, MAX_MOTIVATIONAL_MESSAGE_LENGTH));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateLessonMotivationalMessage(lessonId, message);
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Mensaje motivador guardado');
      router.refresh();
    });
  };

  return (
    <section
      className={cn(
        'rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 p-4 sm:p-5',
        className
      )}
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquareQuote className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            Mensaje motivador de la lección
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Lo verán los estudiantes al abrir esta clase. Déjalo vacío para ocultarlo.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 self-start text-xs"
          onClick={() => setShowPreview((v) => !v)}
          disabled={!message.trim()}
        >
          {showPreview ? 'Ocultar vista previa' : 'Vista previa'}
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`motivational-lesson-${lessonId}`} className="sr-only">
          Mensaje motivador para {lessonTitle}
        </Label>
        <Textarea
          id={`motivational-lesson-${lessonId}`}
          name="motivational_message"
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Ej: Para dominar el acordeón, practica con paciencia cada día."
          className="min-h-[88px] resize-y bg-background/80 text-sm"
          disabled={isPending}
          autoComplete="off"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">{charsLeft} caracteres restantes</p>
          <Button
            type="button"
            size="sm"
            disabled={isPending || !hasChanges}
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar mensaje'
            )}
          </Button>
        </div>
      </div>

      {showPreview && message.trim() && (
        <div className="mt-4 border-t border-amber-500/15 pt-4">
          <CourseMotivationalBanner
            message={message}
            subtitle={`Inspiración para «${lessonTitle}»`}
          />
        </div>
      )}
    </section>
  );
}
