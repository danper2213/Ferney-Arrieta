-- Recursos descargables/reproducibles por lección (PDF, audio, imágenes)
CREATE TABLE IF NOT EXISTS public.lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('pdf', 'audio', 'image')),
  file_size bigint NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson_id
  ON public.lesson_resources(lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_resources_order
  ON public.lesson_resources(lesson_id, order_index);

ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Master can manage lesson resources" ON public.lesson_resources;
CREATE POLICY "Master can manage lesson resources"
ON public.lesson_resources FOR ALL
TO authenticated
USING (public.current_user_role() = 'master')
WITH CHECK (public.current_user_role() = 'master');

DROP POLICY IF EXISTS "Enrolled students can read lesson resources" ON public.lesson_resources;
CREATE POLICY "Enrolled students can read lesson resources"
ON public.lesson_resources FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE l.id = lesson_resources.lesson_id
      AND e.user_id = auth.uid()
  )
);

-- Bucket privado para recursos de lección
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-resources',
  'lesson-resources',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg',
    'audio/webm', 'audio/aac', 'audio/mp4', 'audio/x-m4a',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Master upload lesson resources" ON storage.objects;
CREATE POLICY "Master upload lesson resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-resources'
  AND public.current_user_role() = 'master'
);

DROP POLICY IF EXISTS "Master update lesson resources" ON storage.objects;
CREATE POLICY "Master update lesson resources"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-resources'
  AND public.current_user_role() = 'master'
)
WITH CHECK (
  bucket_id = 'lesson-resources'
  AND public.current_user_role() = 'master'
);

DROP POLICY IF EXISTS "Master delete lesson resources storage" ON storage.objects;
CREATE POLICY "Master delete lesson resources storage"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-resources'
  AND public.current_user_role() = 'master'
);

DROP POLICY IF EXISTS "Master read lesson resources storage" ON storage.objects;
CREATE POLICY "Master read lesson resources storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-resources'
  AND public.current_user_role() = 'master'
);

DROP POLICY IF EXISTS "Enrolled students read lesson resources storage" ON storage.objects;
CREATE POLICY "Enrolled students read lesson resources storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-resources'
  AND EXISTS (
    SELECT 1
    FROM public.lesson_resources lr
    JOIN public.lessons l ON l.id = lr.lesson_id
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE lr.storage_path = name
      AND e.user_id = auth.uid()
  )
);
