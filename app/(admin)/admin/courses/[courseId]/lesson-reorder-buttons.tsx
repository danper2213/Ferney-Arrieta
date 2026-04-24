'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { moveLesson } from './actions';
import { ReorderControls } from '@/components/admin/ReorderControls';

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
    <ReorderControls
      pending={pending}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      onMoveUp={() => run('up')}
      onMoveDown={() => run('down')}
      labels={{
        group: 'Reordenar esta lección en el módulo',
        moveUp: 'Subir lección',
        moveDown: 'Bajar lección',
      }}
    />
  );
}
