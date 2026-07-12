-- Renombra campos del esquema anterior y elimina columnas no usadas

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'person_role'
  ) THEN
    ALTER TABLE public.testimonials RENAME COLUMN person_role TO country;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'quote'
  ) THEN
    ALTER TABLE public.testimonials RENAME COLUMN quote TO description;
  END IF;
END $$;

ALTER TABLE public.testimonials DROP COLUMN IF EXISTS course_id;

-- Asegura NOT NULL en country para filas existentes
UPDATE public.testimonials SET country = 'Colombia' WHERE country IS NULL OR trim(country) = '';
ALTER TABLE public.testimonials ALTER COLUMN country SET NOT NULL;
