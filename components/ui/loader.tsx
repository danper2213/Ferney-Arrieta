import { cn } from '@/lib/utils';

export type LoaderVariant = 'spinner' | 'dots' | 'pulse';

export interface LoaderProps {
  variant?: LoaderVariant;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  /** Para fondos oscuros (ej. botón primary) */
  invert?: boolean;
  className?: string;
}

export function Loader({
  variant = 'spinner',
  size = 'md',
  label,
  invert = false,
  className,
}: LoaderProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2',
        invert && 'text-primary-foreground',
        className,
      )}
      role="status"
      aria-label={label ?? 'Cargando'}
    >
      {variant === 'spinner' && (
        <span
          className={cn(
            'loader-spinner rounded-full border-2 shrink-0',
            invert
              ? 'border-primary-foreground/30 border-t-primary-foreground'
              : 'border-primary/20 border-t-primary',
            size === 'sm' && 'h-4 w-4',
            size === 'md' && 'h-5 w-5',
            size === 'lg' && 'h-8 w-8',
          )}
        />
      )}
      {variant === 'dots' && (
        <span className="loader-dots flex gap-1">
          <span
            className={cn(
              'loader-dot h-1.5 w-1.5 rounded-full shrink-0',
              invert ? 'bg-primary-foreground' : 'bg-primary',
            )}
          />
          <span
            className={cn(
              'loader-dot h-1.5 w-1.5 rounded-full shrink-0 [animation-delay:0.2s]',
              invert ? 'bg-primary-foreground' : 'bg-primary',
            )}
          />
          <span
            className={cn(
              'loader-dot h-1.5 w-1.5 rounded-full shrink-0 [animation-delay:0.4s]',
              invert ? 'bg-primary-foreground' : 'bg-primary',
            )}
          />
        </span>
      )}
      {variant === 'pulse' && (
        <span
          className={cn(
            'loader-pulse rounded-full shrink-0',
            invert ? 'bg-primary-foreground/80' : 'bg-primary/80',
            size === 'sm' && 'h-4 w-4',
            size === 'md' && 'h-5 w-5',
            size === 'lg' && 'h-8 w-8',
          )}
        />
      )}
      {label && (
        <span
          className={cn(
            'text-sm font-medium',
            invert ? 'text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}

/** Pantalla de carga a página completa para rutas (loading.tsx) */
export function LoadingScreen({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="flex flex-col items-center gap-6">
        <Loader variant="spinner" size="lg" className="text-primary" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
