-- Base schema for the Video LMS.
--
-- Historically these core tables (profiles, courses, modules, lessons,
-- enrollments, app_settings) were created directly in the hosted Supabase
-- project and never committed as a migration, so the later migrations in this
-- folder only ALTER/attach RLS to tables they assume already exist. That makes
-- it impossible to bootstrap the database from scratch (local dev, CI, a fresh
-- environment).
--
-- This migration reconstructs that base schema. Every statement is idempotent
-- (IF NOT EXISTS / CREATE OR REPLACE / guarded policies) so it is a safe no-op
-- against any environment where the tables already exist.

-- Needed for gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- profiles: 1:1 with auth.users. role drives access ('student' | 'master').
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'master')),
  display_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- courses: catalog of courses shown on the landing and student dashboard.
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  thumbnail_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- modules: ordered sections within a course.
CREATE TABLE IF NOT EXISTS public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);

-- lessons: ordered lessons within a module. days_to_unlock drives drip access.
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  days_to_unlock integer NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  video_provider_id text
);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);

-- enrollments: which student has access to which course, and since when.
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);

-- app_settings: simple key/value store (e.g. whatsapp_support_number).
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text,
  label text
);

-- current_user_role() is used by RLS policies in later migrations. It is
-- defined here (CREATE OR REPLACE) so the modules/lessons policies below can
-- reference it; the later migration redefines it identically.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- modules / lessons RLS: no later migration attaches policies to these tables,
-- so define them here. Everyone can read (needed for the course outline and
-- student player); only the master can mutate.
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Modules are readable by all" ON public.modules;
CREATE POLICY "Modules are readable by all"
ON public.modules FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Master can manage modules" ON public.modules;
CREATE POLICY "Master can manage modules"
ON public.modules FOR ALL
TO authenticated
USING (public.current_user_role() = 'master')
WITH CHECK (public.current_user_role() = 'master');

DROP POLICY IF EXISTS "Lessons are readable by all" ON public.lessons;
CREATE POLICY "Lessons are readable by all"
ON public.lessons FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Master can manage lessons" ON public.lessons;
CREATE POLICY "Master can manage lessons"
ON public.lessons FOR ALL
TO authenticated
USING (public.current_user_role() = 'master')
WITH CHECK (public.current_user_role() = 'master');
