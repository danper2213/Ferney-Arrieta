-- RLS en profiles: cada usuario puede leer su perfil; el master puede leer todos (para /admin/students).
-- Usamos una función SECURITY DEFINER para evitar recursión infinita al comprobar el rol del master.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Función que devuelve el rol del usuario actual sin pasar por RLS (evita recursión en políticas)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Cualquier usuario autenticado puede leer su propio perfil
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- El master puede leer todos los perfiles (usa la función para no consultar profiles dentro de la política)
DROP POLICY IF EXISTS "Master can read all profiles" ON public.profiles;
CREATE POLICY "Master can read all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.current_user_role() = 'master');
