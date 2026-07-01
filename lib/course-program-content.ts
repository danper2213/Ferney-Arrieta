export const MAX_PROGRAM_CONTENT_LENGTH = 8000;

export const PROGRAM_CONTENT_MIGRATION =
  'supabase/migrations/20250630120000_course_learning_outcomes.sql';

export function normalizeProgramContent(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, MAX_PROGRAM_CONTENT_LENGTH);
}
