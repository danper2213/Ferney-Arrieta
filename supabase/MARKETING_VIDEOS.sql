-- Tabla para videos de marketing (contenido gratuito en la landing)
CREATE TABLE IF NOT EXISTS public.marketing_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_provider_id text NOT NULL,
  thumbnail_url text,
  cta_text text,
  cta_link text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_videos_active ON public.marketing_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_marketing_videos_order ON public.marketing_videos(order_index);

ALTER TABLE public.marketing_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active marketing videos"
ON public.marketing_videos FOR SELECT
TO public
USING (is_active = true);
