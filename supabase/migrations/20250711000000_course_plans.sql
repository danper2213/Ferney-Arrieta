-- Planes / mentorías asociadas a un curso (VIP, Ganador, VIP Plus, etc.)
CREATE TABLE IF NOT EXISTS public.course_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  plan_key text NOT NULL,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  payment_link text,
  badge text,
  is_highlighted boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_plans_features_is_array CHECK (jsonb_typeof(features) = 'array'),
  CONSTRAINT course_plans_course_key_unique UNIQUE (course_id, plan_key)
);

CREATE INDEX IF NOT EXISTS course_plans_course_id_idx
  ON public.course_plans (course_id, order_index);

COMMENT ON TABLE public.course_plans IS
  'Planes de mentoría / plus mostrados en la landing bajo el programa base.';

ALTER TABLE public.course_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Course plans are readable by all" ON public.course_plans;
CREATE POLICY "Course plans are readable by all"
ON public.course_plans FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Master can insert course plans" ON public.course_plans;
CREATE POLICY "Master can insert course plans"
ON public.course_plans FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'master'
  )
);

DROP POLICY IF EXISTS "Master can update course plans" ON public.course_plans;
CREATE POLICY "Master can update course plans"
ON public.course_plans FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'master'
  )
);

DROP POLICY IF EXISTS "Master can delete course plans" ON public.course_plans;
CREATE POLICY "Master can delete course plans"
ON public.course_plans FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'master'
  )
);
