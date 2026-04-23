-- Permite al rol master eliminar datos de estudiantes desde el panel admin.
-- Requiere public.current_user_role() definido en 20250131000002_profiles_rls_for_master.sql

DROP POLICY IF EXISTS "Master can delete comments" ON public.comments;
CREATE POLICY "Master can delete comments"
ON public.comments FOR DELETE
TO authenticated
USING (public.current_user_role() = 'master');

DROP POLICY IF EXISTS "Master can delete progress" ON public.progress;
CREATE POLICY "Master can delete progress"
ON public.progress FOR DELETE
TO authenticated
USING (public.current_user_role() = 'master');

DROP POLICY IF EXISTS "Master can delete student profiles" ON public.profiles;
CREATE POLICY "Master can delete student profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.current_user_role() = 'master' AND role = 'student');
