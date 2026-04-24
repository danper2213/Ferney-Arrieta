'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ReorderLabels = {
  group: string;
  moveUp: string;
  moveDown: string;
};

type ReorderControlsProps = {
  canMoveUp: boolean;
  canMoveDown: boolean;
  pending: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  labels: ReorderLabels;
};

/**
 * Botones para subir/bajar un ítem; evita propagación para no interferir con acordeones.
 */
export function ReorderControls({
  canMoveUp,
  canMoveDown,
  pending,
  onMoveUp,
  onMoveDown,
  labels,
}: ReorderControlsProps) {
  return (
    <div
      role="group"
      aria-label={labels.group}
      aria-busy={pending}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'flex shrink-0 items-stretch rounded-xl border border-border/70 bg-muted/40 p-0.5 shadow-sm',
        'ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'h-9 min-h-9 gap-1 rounded-lg px-2 font-medium text-muted-foreground sm:px-2.5',
          'hover:bg-background hover:text-foreground',
          'disabled:pointer-events-none disabled:opacity-40',
        )}
        disabled={!canMoveUp || pending}
        onClick={() => onMoveUp()}
        title={labels.moveUp}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        ) : (
          <ChevronUp className="h-4 w-4 shrink-0" aria-hidden />
        )}
        <span className="hidden max-w-[4.5rem] truncate sm:inline">
          {pending ? 'Guardando…' : labels.moveUp}
        </span>
      </Button>
      <div className="my-1 w-px shrink-0 self-stretch bg-border/80" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'h-9 min-h-9 gap-1 rounded-lg px-2 font-medium text-muted-foreground sm:px-2.5',
          'hover:bg-background hover:text-foreground',
          'disabled:pointer-events-none disabled:opacity-40',
        )}
        disabled={!canMoveDown || pending}
        onClick={() => onMoveDown()}
        title={labels.moveDown}
      >
        <ChevronDown className="h-4 w-4 shrink-0 opacity-100" aria-hidden />
        <span className="hidden max-w-[4.5rem] truncate sm:inline">{labels.moveDown}</span>
      </Button>
    </div>
  );
}
