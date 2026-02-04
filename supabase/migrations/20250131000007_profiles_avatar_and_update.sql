-- Columna avatar_url en profiles (para foto de perfil del estudiante)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Permitir que cada usuario actualice su propio perfil (nombre y avatar)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
