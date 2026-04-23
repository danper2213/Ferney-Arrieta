'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { moveModule } from './actions';

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
    <div
      className="flex shrink-0 flex-col gap-px"
      role="group"
      aria-label="Reordenar este módulo en el curso"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
        disabled={!canMoveUp || pending}
        onClick={() => run('up')}
        title="Mover el módulo hacia arriba en el curso"
      >
        <ChevronUp className="h-4 w-4" aria-hidden />
        <span className="sr-only">Mover módulo hacia arriba</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
        disabled={!canMoveDown || pending}
        onClick={() => run('down')}
        title="Mover el módulo hacia abajo en el curso"
      >
        <ChevronDown className="h-4 w-4" aria-hidden />
        <span className="sr-only">Mover módulo hacia abajo</span>
      </Button>
    </div>
  );
}
