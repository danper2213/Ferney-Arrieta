-- Mensaje motivador personalizado por curso (visible para estudiantes inscritos)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS motivational_message text;

COMMENT ON COLUMN public.courses.motivational_message IS
  'Mensaje motivador que ven los estudiantes dentro del curso. NULL o vacío = no se muestra.';
