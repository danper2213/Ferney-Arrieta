-- RLS en courses: cualquiera puede leer (landing y dashboard); el master puede INSERT, UPDATE y DELETE.

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Lectura: todos pueden leer cursos (landing pública y panel estudiante)
DROP POLICY IF EXISTS "Courses are readable by all" ON public.courses;
CREATE POLICY "Courses are readable by all"
ON public.courses FOR SELECT
TO public
USING (true);

-- Master puede insertar cursos
DROP POLICY IF EXISTS "Master can insert courses" ON public.courses;
CREATE POLICY "Master can insert courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (public.current_user_role() = 'master');

-- Master puede actualizar cursos (editar, publicar)
DROP POLICY IF EXISTS "Master can update courses" ON public.courses;
CREATE POLICY "Master can update courses"
ON public.courses FOR UPDATE
TO authenticated
USING (public.current_user_role() = 'master');

-- Master puede eliminar cursos
DROP POLICY IF EXISTS "Master can delete courses" ON public.courses;
CREATE POLICY "Master can delete courses"
ON public.courses FOR DELETE
TO authenticated
USING (public.current_user_role() = 'master');
