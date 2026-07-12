-- Testimonios en video para la landing (estudiantes que han tomado el curso)

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name text NOT NULL,
  country text NOT NULL,
  description text,
  video_provider_id text NOT NULL,
  thumbnail_url text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON public.testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON public.testimonials(order_index);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active testimonials" ON public.testimonials;
CREATE POLICY "Anyone can read active testimonials"
ON public.testimonials FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Master can manage testimonials" ON public.testimonials;
CREATE POLICY "Master can manage testimonials"
ON public.testimonials FOR ALL
TO authenticated
USING (public.current_user_role() = 'master')
WITH CHECK (public.current_user_role() = 'master');
