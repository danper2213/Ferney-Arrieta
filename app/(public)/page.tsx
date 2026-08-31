import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { generateBunnyToken } from '@/lib/bunny/token';
import { TestimonialVideoCard } from '@/components/landing/TestimonialVideoCard';
import { FeaturedProgramsList } from '@/components/landing/FeaturedProgramsList';
import { BonusSongsSection } from '@/components/landing/BonusSongsSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { normalizeProgramContent } from '@/lib/course-program-content';
import {
  DEFAULT_DOMINA_PLANS,
  parseCoursePlanRow,
  type CoursePlan,
} from '@/lib/course-plans';
import { isMissingColumnError, isMissingRelationError } from '@/lib/supabase/schema-fallback';
import { resolveBunnyVideoThumbnailUrl } from '@/lib/bunny/thumbnail';
import { ArrowRight, BookOpen, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Revalidar la landing cada 60 segundos
export const revalidate = 60;

// Color de acento: azul profesional (#2563EB = blue-600)
const ACCENT = 'text-blue-400';
const ACCENT_BG = 'bg-blue-600 hover:bg-blue-500';

/** Márgenes horizontales y ancho máx. alineados con «Programas destacados» */
const LANDING_SECTION_INNER =
  'container mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6';
/** Padding vertical homogéneo entre secciones */
const LANDING_SECTION_Y = 'py-10 sm:py-16 md:py-20';

function buildWhatsAppUrl(courseTitle: string, whatsappNumber: string): string {
  const num = (whatsappNumber || (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '')).replace(/\D/g, '');
  if (!num) return '#';
  const message = `Hola, estoy interesado en el curso ${courseTitle} que vi en la web. ¿Me podrías enviar el link de pago de Bold?`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

function isDominaCourse(course: { title: string; slug: string }) {
  return /domina|acorde[oó]n/i.test(`${course.slug} ${course.title}`);
}

function isCancionesCourse(course: { title: string; slug: string }) {
  return /cancion/i.test(`${course.slug} ${course.title}`);
}

type PublishedCourseRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  payment_link: string | null;
  program_content?: string | null;
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let courses: PublishedCourseRow[] = [];
  let coursesError: { message?: string; code?: string } | null = null;

  const { data: coursesWithProgram, error: coursesWithProgramError } = await supabase
    .from('courses')
    .select('id, title, slug, description, thumbnail_url, payment_link, program_content')
    .eq('is_published', true)
    .order('created_at', { ascending: true });

  if (coursesWithProgramError && isMissingColumnError(coursesWithProgramError)) {
    const fallback = await supabase
      .from('courses')
      .select('id, title, slug, description, thumbnail_url, payment_link')
      .eq('is_published', true)
      .order('created_at', { ascending: true });
    courses = (fallback.data ?? []).map((course) => ({
      ...course,
      program_content: null,
    }));
    coursesError = fallback.error;
  } else {
    courses = coursesWithProgram ?? [];
    coursesError = coursesWithProgramError;
  }

  const { data: testimonialsRaw = [], error: testimonialsError } = await supabase
    .from('testimonials')
    .select('id, person_name, country, description, video_provider_id, thumbnail_url')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  let enrolledCourseIds: string[] = [];
  if (user) {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id);
    enrolledCourseIds = (enrollments ?? []).map((e) => e.course_id);
  }

  const { data: whatsappSetting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'whatsapp_support_number')
    .maybeSingle();
  const whatsappNumber =
    (whatsappSetting as { value?: string } | null)?.value?.trim() ??
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
    '';

  const libraryId = (process.env.BUNNY_LIBRARY_ID ?? '').split('#')[0].trim();

  function buildEmbedUrl(providerId?: string | null) {
    const tokenResult = providerId ? generateBunnyToken(providerId, 3600) : null;
    const signedUrl = tokenResult && 'embedUrl' in tokenResult ? tokenResult.embedUrl : '';
    return (
      signedUrl ||
      (providerId && libraryId
        ? `https://player.mediadelivery.net/embed/${libraryId}/${providerId}`
        : '')
    );
  }

  const testimonials = testimonialsError
    ? []
    : await Promise.all(
    (testimonialsRaw ?? []).map(async (row) => {
      const item = row as {
        id: string;
        person_name: string;
        country?: string;
        description?: string | null;
        video_provider_id?: string;
        thumbnail_url?: string | null;
      };
      const providerId = item.video_provider_id;
      const thumbnailUrl =
        item.thumbnail_url ||
        (providerId ? await resolveBunnyVideoThumbnailUrl(providerId) : null);

      return {
        id: item.id,
        person_name: item.person_name,
        country: item.country ?? '',
        description: item.description ?? null,
        thumbnail_url: thumbnailUrl,
        embedUrl: buildEmbedUrl(providerId),
      };
    }),
  );

  const courseList = (courses ?? []).map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    thumbnail_url: course.thumbnail_url,
    payment_link: course.payment_link,
    programContent: normalizeProgramContent(course.program_content),
  }));

  const cancionesCourse = courseList.find((c) => isCancionesCourse(c)) ?? null;
  /** Programas publicados en orden de creación (más antiguos primero), sin Canciones */
  const featuredCourses = courseList.filter((c) => !isCancionesCourse(c));

  const courseIds = courseList.map((c) => c.id);
  const plansByCourseId: Record<string, CoursePlan[]> = {};

  if (courseIds.length > 0) {
    const { data: plansRaw, error: plansError } = await supabase
      .from('course_plans')
      .select('*')
      .in('course_id', courseIds)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (plansError && !isMissingRelationError(plansError) && !isMissingColumnError(plansError)) {
      console.error('Error loading course_plans:', plansError);
    } else {
      for (const row of plansRaw ?? []) {
        const plan = parseCoursePlanRow(row as Record<string, unknown>);
        if (!plansByCourseId[plan.course_id]) plansByCourseId[plan.course_id] = [];
        plansByCourseId[plan.course_id].push(plan);
      }
    }
  }

  function resolvePlansForCourse(course: { id: string; title: string; slug: string }): CoursePlan[] {
    const fromDb = plansByCourseId[course.id] ?? [];
    if (fromDb.length > 0) return fromDb;

    if (!isDominaCourse(course)) return [];

    return DEFAULT_DOMINA_PLANS.map((plan, index) => ({
      id: `default-${plan.plan_key}`,
      course_id: course.id,
      ...plan,
      payment_link: plan.payment_link || null,
      badge: plan.badge || null,
      order_index: index,
    }));
  }

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-hidden bg-slate-950 text-white">
      <HeroSection />

      {/* ——— Programas destacados (orden de creación) + programa adicional ——— */}
      <section
        id="programas"
        className={cn('scroll-mt-4 border-t border-slate-800/80 bg-slate-900', LANDING_SECTION_Y)}
      >
        <div className={LANDING_SECTION_INNER}>
          <h2 className="mb-2 px-1 text-center text-xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Nuestros Programas Destacados
          </h2>
          <p className="mx-auto mb-6 max-w-2xl px-1 text-center text-sm text-slate-400 sm:mb-10 sm:text-base md:mb-12">
            Explora nuestros programas en el orden en que fueron creados. Al final encontrarás el
            programa adicional que se desbloquea al culminar.
          </p>

          {featuredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-950 py-12 sm:rounded-2xl sm:py-14">
              <BookOpen className="mb-3 h-10 w-10 text-slate-500 sm:h-12 sm:w-12" />
              <p className="text-sm text-slate-400 sm:text-base">
                Próximamente nuevos programas.
              </p>
            </div>
          ) : (
            <>
              <FeaturedProgramsList
                courses={featuredCourses}
                resolvePlans={resolvePlansForCourse}
                enrolledCourseIds={enrolledCourseIds}
                userEmail={user?.email ?? null}
                whatsappNumber={whatsappNumber}
                buildWhatsAppUrl={(title) => buildWhatsAppUrl(title, whatsappNumber)}
                accentBg={ACCENT_BG}
              />

              <div className="mt-12 border-t border-slate-800/80 pt-10 sm:mt-14 sm:pt-12 md:mt-16 md:pt-14">
                <BonusSongsSection
                  title={cancionesCourse?.title ?? 'Programa de Canciones'}
                  description={
                    cancionesCourse?.description?.trim() ||
                    'Un repertorio pensado para aplicar lo que aprendes en Domina el Acordeón. No se compra por separado: lo desbloqueas automáticamente al culminar el programa base.'
                  }
                  imageUrl={cancionesCourse?.thumbnail_url ?? null}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* ——— Testimonios de estudiantes ——— */}
      <section
        id="testimonios"
        className={cn('scroll-mt-4 border-t border-slate-800/80 bg-slate-900', LANDING_SECTION_Y)}
      >
        <div className={LANDING_SECTION_INNER}>
          <p className={cn('mb-2 text-center text-xs font-semibold uppercase tracking-widest sm:mb-3 sm:text-sm', ACCENT)}>
            Historias reales
          </p>
          <h2 className="mb-3 px-1 text-center text-2xl font-bold tracking-tight text-white sm:mb-4 sm:text-3xl md:text-4xl">
            Lo Que Dicen Nuestros Estudiantes
          </h2>
          <p className="mx-auto mb-8 max-w-2xl px-1 text-center text-sm text-slate-400 sm:mb-14 sm:text-lg">
            Escucha directamente a quienes ya han vivido la experiencia y los resultados de nuestros programas.
          </p>

          {testimonials.filter((t) => t.embedUrl).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-950 px-4 py-12 sm:rounded-2xl sm:py-16">
              <MessageCircle className="mb-4 h-10 w-10 text-slate-500 sm:h-12 sm:w-12" />
              <p className="text-center text-sm text-slate-400 sm:text-base">
                Próximamente testimonios de estudiantes.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {testimonials
                .filter((t) => t.embedUrl)
                .map((testimonial) => (
                  <TestimonialVideoCard key={testimonial.id} testimonial={testimonial} />
                ))}
            </div>
          )}

          <div className="mt-8 text-center sm:mt-12">
            <Link
              href="#programas"
              className={cn(
                'inline-flex min-h-11 w-full max-w-xs items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors sm:min-h-0 sm:w-auto sm:text-base',
                ACCENT_BG
              )}
            >
              Quiero ser el próximo
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter user={user} />
    </div>
  );
}