export const MAX_MOTIVATIONAL_MESSAGE_LENGTH = 500;

export const LESSON_MOTIVATIONAL_MESSAGE_MIGRATION =
  'supabase/migrations/20250621150000_lesson_motivational_message.sql';

export function trimMotivationalMessage(message: string): string {
  return message.trim().slice(0, MAX_MOTIVATIONAL_MESSAGE_LENGTH);
}
