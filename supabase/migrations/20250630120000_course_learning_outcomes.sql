-- Texto del programa visible en la landing (Programas destacados)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS program_content text;

COMMENT ON COLUMN public.courses.program_content IS
  'Texto libre sobre lo que aprenderán en el curso. Se muestra en el home. Editable solo por master.';
