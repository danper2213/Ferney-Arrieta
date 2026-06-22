-- Duración de acceso por curso (días). NULL = sin valor por defecto (usar 365 en app).
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS default_access_days integer DEFAULT 365;

-- Fecha de expiración por inscripción. NULL = acceso ilimitado.
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_enrollments_expires_at
  ON public.enrollments(expires_at)
  WHERE expires_at IS NOT NULL;

COMMENT ON COLUMN public.courses.default_access_days IS
  'Días de acceso al conceder inscripción. Por defecto 365 (1 año).';

COMMENT ON COLUMN public.enrollments.expires_at IS
  'Fecha límite de acceso al curso. NULL = ilimitado.';
