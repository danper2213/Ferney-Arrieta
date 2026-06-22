-- Mensaje motivador personalizado por lección (visible para estudiantes en cada clase)
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS motivational_message text;

COMMENT ON COLUMN public.lessons.motivational_message IS
  'Mensaje motivador que ven los estudiantes en esta lección. NULL o vacío = no se muestra.';
