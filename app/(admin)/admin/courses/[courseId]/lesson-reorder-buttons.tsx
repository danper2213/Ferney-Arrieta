'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { moveLesson } from './actions';

type LessonReorderButtonsProps = {
  lessonId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function LessonReorderButtons({ lessonId, canMoveUp, canMoveDown }: LessonReorderButtonsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (direction: 'up' | 'down') => {
    startTransition(async () => {
      const result = await moveLesson(lessonId, direction);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      toast.success('Orden de lecciones actualizado');
      router.refresh();
    });
  };

  return (
    <div
      className="flex shrink-0 flex-col gap-px"
      role="group"
      aria-label="Reordenar esta lección en el módulo"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
        disabled={!canMoveUp || pending}
        onClick={() => run('up')}
        title="Mover la lección hacia arriba en el módulo"
      >
        <ChevronUp className="h-4 w-4" aria-hidden />
        <span className="sr-only">Mover lección hacia arriba</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
        disabled={!canMoveDown || pending}
        onClick={() => run('down')}
        title="Mover la lección hacia abajo en el módulo"
      >
        <ChevronDown className="h-4 w-4" aria-hidden />
        <span className="sr-only">Mover lección hacia abajo</span>
      </Button>
    </div>
  );
}
