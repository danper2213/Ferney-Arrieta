-- RLS en app_settings: todos pueden leer (para landing, etc.); solo master puede actualizar.

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Lectura: todos pueden leer (para obtener whatsapp_support_number en la landing)
DROP POLICY IF EXISTS "app_settings readable by all" ON public.app_settings;
CREATE POLICY "app_settings readable by all"
ON public.app_settings FOR SELECT
TO public
USING (true);

-- Solo master puede actualizar
DROP POLICY IF EXISTS "Master can update app_settings" ON public.app_settings;
CREATE POLICY "Master can update app_settings"
ON public.app_settings FOR UPDATE
TO authenticated
USING (public.current_user_role() = 'master');

-- Solo master puede insertar (opcional, para crear nuevas keys desde el admin)
DROP POLICY IF EXISTS "Master can insert app_settings" ON public.app_settings;
CREATE POLICY "Master can insert app_settings"
ON public.app_settings FOR INSERT
TO authenticated
WITH CHECK (public.current_user_role() = 'master');
