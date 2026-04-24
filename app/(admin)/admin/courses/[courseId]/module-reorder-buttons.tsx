'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { moveModule } from './actions';
import { ReorderControls } from '@/components/admin/ReorderControls';

type ModuleReorderButtonsProps = {
  moduleId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function ModuleReorderButtons({ moduleId, canMoveUp, canMoveDown }: ModuleReorderButtonsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (direction: 'up' | 'down') => {
    startTransition(async () => {
      const result = await moveModule(moduleId, direction);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      toast.success('Orden de módulos actualizado');
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
        group: 'Reordenar este módulo en el curso',
        moveUp: 'Subir módulo',
        moveDown: 'Bajar módulo',
      }}
    />
  );
}
