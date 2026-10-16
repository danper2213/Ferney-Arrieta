-- Posición de reproducción estilo Netflix: guardar minuto visto y última actividad.
-- is_completed pasa a default false para permitir filas de progreso en curso.

ALTER TABLE public.progress
  ALTER COLUMN is_completed SET DEFAULT false;

ALTER TABLE public.progress
  ADD COLUMN IF NOT EXISTS last_position_seconds numeric NOT NULL DEFAULT 0;

ALTER TABLE public.progress
  ADD COLUMN IF NOT EXISTS last_watched_at timestamptz NOT NULL DEFAULT now();

-- Filas antiguas (solo completadas): usar completed_at como última actividad.
UPDATE public.progress
SET last_watched_at = COALESCE(completed_at, now())
WHERE completed_at IS NOT NULL
  AND last_position_seconds = 0;

CREATE INDEX IF NOT EXISTS idx_progress_user_last_watched
  ON public.progress (user_id, last_watched_at DESC);
