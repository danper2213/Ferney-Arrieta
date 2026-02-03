-- RLS en enrollments: usuarios leen sus propias inscripciones; el master puede leer, insertar y eliminar cualquiera.

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden leer sus propias inscripciones (para dashboard y acceso al curso)
DROP POLICY IF EXISTS "Users can read own enrollments" ON public.enrollments;
CREATE POLICY "Users can read own enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Master puede leer todas las inscripciones (para /admin/students)
DROP POLICY IF EXISTS "Master can read all enrollments" ON public.enrollments;
CREATE POLICY "Master can read all enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (public.current_user_role() = 'master');

-- Master puede insertar inscripciones (asignar curso a estudiante)
DROP POLICY IF EXISTS "Master can insert enrollments" ON public.enrollments;
CREATE POLICY "Master can insert enrollments"
ON public.enrollments FOR INSERT
TO authenticated
WITH CHECK (public.current_user_role() = 'master');

-- Master puede eliminar inscripciones (quitar acceso)
DROP POLICY IF EXISTS "Master can delete enrollments" ON public.enrollments;
CREATE POLICY "Master can delete enrollments"
ON public.enrollments FOR DELETE
TO authenticated
USING (public.current_user_role() = 'master');
