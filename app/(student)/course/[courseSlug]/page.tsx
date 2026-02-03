import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function CourseSlugPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .maybeSingle();

  if (!course) {
    redirect('/');
  }

  const { data: modulesList } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })
    .limit(1);

  const firstModuleId = modulesList?.[0]?.id;
  if (!firstModuleId) redirect('/dashboard');

  const { data: firstLessonRow } = await supabase
    .from('lessons')
    .select('id')
    .eq('module_id', firstModuleId)
    .order('order_index', { ascending: true })
    .limit(1)
    .maybeSingle();

  const lessonId = firstLessonRow?.id;

  if (lessonId) {
    redirect(`/course/${courseSlug}/lesson/${lessonId}`);
  }

  redirect('/dashboard');
}
