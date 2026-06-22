export type LessonResourceType = 'pdf' | 'audio' | 'image';

export type LessonResource = {
  id: string;
  lesson_id: string;
  title: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  resource_type: LessonResourceType;
  file_size: number;
  order_index: number;
  created_at?: string;
};

const PDF_MIME_TYPES = new Set(['application/pdf']);
const AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/aac',
  'audio/mp4',
  'audio/x-m4a',
]);
const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const MAX_RESOURCE_SIZE_BYTES = 50 * 1024 * 1024;

export function getResourceTypeFromMime(mimeType: string): LessonResourceType | null {
  const normalized = mimeType.toLowerCase().split(';')[0].trim();
  if (PDF_MIME_TYPES.has(normalized)) return 'pdf';
  if (AUDIO_MIME_TYPES.has(normalized) || normalized.startsWith('audio/')) return 'audio';
  if (IMAGE_MIME_TYPES.has(normalized) || normalized.startsWith('image/')) return 'image';
  return null;
}

export function isAllowedResourceFile(file: File): boolean {
  return getResourceTypeFromMime(file.type) !== null;
}

export function getResourceTypeLabel(type: LessonResourceType): string {
  switch (type) {
    case 'pdf':
      return 'PDF';
    case 'audio':
      return 'Audio';
    case 'image':
      return 'Imagen';
  }
}

export function formatResourceSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function sanitizeResourceFileName(name: string): string {
  return name.replace(/[^\w.\-() ]+/g, '_').slice(0, 180);
}

export function buildLessonResourceStoragePath(
  lessonId: string,
  resourceId: string,
  fileName: string
): string {
  const safeName = sanitizeResourceFileName(fileName);
  return `${lessonId}/${resourceId}/${safeName}`;
}

export { MAX_RESOURCE_SIZE_BYTES };

export const LESSON_RESOURCES_BUCKET = 'lesson-resources';

type SupabaseClient = Awaited<
  ReturnType<typeof import('@/lib/supabase/server').createClient>
>;

export async function deleteLessonResourcesForLesson(
  supabase: SupabaseClient,
  lessonId: string
): Promise<void> {
  const { data: resources } = await supabase
    .from('lesson_resources')
    .select('storage_path')
    .eq('lesson_id', lessonId);

  const paths = (resources ?? []).map((r) => r.storage_path).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(LESSON_RESOURCES_BUCKET).remove(paths);
  }
}
