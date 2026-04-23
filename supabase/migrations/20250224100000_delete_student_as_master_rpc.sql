-- Elimina un estudiante (perfil + inscripciones + comentarios + progreso) de forma segura.
-- SECURITY DEFINER evita depender de políticas RLS de DELETE en cada tabla.
-- Solo puede ejecutarla un usuario cuyo rol en profiles sea 'master'.

CREATE OR REPLACE FUNCTION public.delete_student_as_master(p_target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role text;
  v_target_role text;
  v_deleted int;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No autenticado');
  END IF;

  SELECT role INTO v_actor_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  IF v_actor_role IS DISTINCT FROM 'master' THEN
    RETURN json_build_object('success', false, 'error', 'Solo el administrador (master) puede eliminar estudiantes');
  END IF;

  IF p_target_user_id = auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'No puedes eliminar tu propia cuenta desde aquí');
  END IF;

  SELECT role INTO v_target_role FROM public.profiles WHERE id = p_target_user_id LIMIT 1;
  IF v_target_role IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'El estudiante no existe');
  END IF;
  IF v_target_role IS DISTINCT FROM 'student' THEN
    RETURN json_build_object('success', false, 'error', 'Solo se pueden eliminar cuentas con rol estudiante');
  END IF;

  DELETE FROM public.enrollments WHERE user_id = p_target_user_id;
  DELETE FROM public.comments WHERE user_id = p_target_user_id;
  DELETE FROM public.progress WHERE user_id = p_target_user_id;

  DELETE FROM public.profiles WHERE id = p_target_user_id AND role = 'student';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted = 0 THEN
    RETURN json_build_object('success', false, 'error', 'No se pudo eliminar el perfil');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.delete_student_as_master(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_student_as_master(uuid) TO authenticated;
