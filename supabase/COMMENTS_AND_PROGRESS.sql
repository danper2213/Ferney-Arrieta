-- Ejecuta este SQL en Supabase (SQL Editor) si no usas migraciones automáticas.
-- Crea las tablas comments y progress con sus políticas RLS.

-- Tabla comments para comentarios en lecciones
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_lesson_id ON public.comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read comments" ON public.comments;
CREATE POLICY "Authenticated users can read comments"
ON public.comments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert own comments" ON public.comments;
CREATE POLICY "Authenticated users can insert own comments"
ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Tabla progress para marcar lecciones completadas
CREATE TABLE IF NOT EXISTS public.progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT true,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON public.progress(lesson_id);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own progress" ON public.progress;
CREATE POLICY "Users can read own progress"
ON public.progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.progress;
CREATE POLICY "Users can insert own progress"
ON public.progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.progress;
CREATE POLICY "Users can update own progress"
ON public.progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
