-- Soft-delete for modules and lessons: keeps rows (and related progress/resources)
-- so masters can restore from the course Papelera instead of hard-deleting.

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

COMMENT ON COLUMN public.modules.deleted_at IS
  'When set, the module is in trash and hidden from students/active admin outline.';

COMMENT ON COLUMN public.lessons.deleted_at IS
  'When set, the lesson is in trash and hidden from students/active admin outline.';

CREATE INDEX IF NOT EXISTS idx_modules_course_active
  ON public.modules (course_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_module_active
  ON public.lessons (module_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_modules_course_deleted
  ON public.modules (course_id, deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_module_deleted
  ON public.lessons (module_id, deleted_at)
  WHERE deleted_at IS NOT NULL;
