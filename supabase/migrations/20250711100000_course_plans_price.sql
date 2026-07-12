-- Precio visible en la landing por plan
ALTER TABLE public.course_plans
  ADD COLUMN IF NOT EXISTS price_label text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.course_plans.price_label IS
  'Precio mostrado en la landing (ej. $997, $49/mes). Texto libre.';
