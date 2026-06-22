-- Permite al master actualizar inscripciones (p. ej. expires_at al cambiar duración de acceso).
DROP POLICY IF EXISTS "Master can update enrollments" ON public.enrollments;
CREATE POLICY "Master can update enrollments"
ON public.enrollments FOR UPDATE
TO authenticated
USING (public.current_user_role() = 'master')
WITH CHECK (public.current_user_role() = 'master');
