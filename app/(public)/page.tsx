import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { generateBunnyToken } from '@/lib/bunny/token';
import { TestimonialVideoCard } from '@/components/landing/TestimonialVideoCard';
import { HeroSection } from '@/components/landing/HeroSection';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { OutcomesSection } from '@/components/landing/OutcomesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PlatformModulesSection } from '@/components/landing/PlatformModulesSection';
import { ForYouSection } from '@/components/landing/ForYouSection';
import { ChoosePlanSection } from '@/components/landing/ChoosePlanSection';
import { PlanComparisonSection } from '@/components/landing/PlanComparisonSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { ClosingCtaSection } from '@/components/landing/ClosingCtaSection';
import { LandingSection, SectionEyebrow, SectionLead, SectionTitle } from '@/components/landing/LandingSection';
import { parseCoursePlanRow, type CoursePlan } from '@/lib/course-plans';
import { resolveLandingOffers } from '@/lib/landing-offers';
import { isMissingColumnError, isMissingRelationError } from '@/lib/supabase/schema-fallback';
import { resolveBunnyVideoThumbnailUrl } from '@/lib/bunny/thumbnail';
import {
  buildWhatsAppUrl,
  interestWhatsAppMessage,
  LANDING_QUESTION_WHATSAPP_MESSAGE,
} from '@/lib/whatsapp';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const revalidate = 60;

const ACCENT_BG = 'bg-blue-600 hover:bg-blue-500';

function isDominaCourse(course: { title: string; slug: string }) {
  return /domina|acorde[oó]n/i.test(`${course.slug} ${course.title}`);
}

type PublishedCourseRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  payment_link: string | null;
};

async function loadLandingData() {
  const empty = {
    userEmail: null as string | null,
    enrolled: false,
    courseSlug: null as string | null,
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
    plans: [] as CoursePlan[],
    testimonials: [] as Array<{
      id: string;
      person_name: string;
      country: string;
      description: string | null;
      thumbnail_url: string | null;
      embedUrl: string;
    }>,
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let courses: PublishedCourseRow[] = [];
    const { data: coursesRaw, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, slug, description, thumbnail_url, payment_link')
      .eq('is_published', true)
      .order('created_at', { ascending: true });

    if (!coursesError) {
      courses = coursesRaw ?? [];
    }

    const { data: testimonialsRaw = [], error: testimonialsError } = await supabase
      .from('testimonials')
      .select('id, person_name, country, description, video_provider_id, thumbnail_url')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    const dominaCourse = courses.find((course) => isDominaCourse(course)) ?? courses[0] ?? null;

    let enrolled = false;
    if (user && dominaCourse) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('course_id', dominaCourse.id);
      enrolled = (enrollments ?? []).length > 0;
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
          })
        );

    const plans: CoursePlan[] = [];
    if (dominaCourse) {
      const { data: plansRaw, error: plansError } = await supabase
        .from('course_plans')
        .select('*')
        .eq('course_id', dominaCourse.id)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (plansError && !isMissingRelationError(plansError) && !isMissingColumnError(plansError)) {
        console.error('Error loading course_plans:', plansError);
      } else {
        for (const row of plansRaw ?? []) {
          plans.push(parseCoursePlanRow(row as Record<string, unknown>));
        }
      }
    }

    return {
      userEmail: user?.email ?? null,
      enrolled,
      courseSlug: dominaCourse?.slug ?? null,
      whatsappNumber,
      plans,
      testimonials,
    };
  } catch (error) {
    console.error('Landing data unavailable:', error);
    return empty;
  }
}

export default async function LandingPage() {
  const { userEmail, enrolled, courseSlug, whatsappNumber, plans, testimonials } =
    await loadLandingData();
  const offers = resolveLandingOffers(plans);
  const ganadorWhatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    interestWhatsAppMessage(offers.ganador.name)
  );
  const plataformaWhatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    interestWhatsAppMessage(offers.plataforma.name)
  );
  const questionWhatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    LANDING_QUESTION_WHATSAPP_MESSAGE
  );
  const visibleTestimonials = testimonials.filter((item) => item.embedUrl);

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-hidden bg-slate-950 text-white">
      <HeroSection />
      <OutcomesSection />
      <HowItWorksSection />
      <PlatformModulesSection />
      <ForYouSection />
      <ChoosePlanSection
        ganador={offers.ganador}
        plataforma={offers.plataforma}
        ganadorWhatsappUrl={ganadorWhatsappUrl}
        plataformaWhatsappUrl={plataformaWhatsappUrl}
        userEmail={userEmail}
        whatsappNumber={whatsappNumber}
        isEnrolled={enrolled}
        courseSlug={courseSlug}
      />
      <PlanComparisonSection ganador={offers.ganador} plataforma={offers.plataforma} />

      <LandingSection id="testimonios" tone="base">
        <SectionEyebrow>Historias reales</SectionEyebrow>
        <SectionTitle>Lo que dicen nuestros estudiantes</SectionTitle>
        <SectionLead>
          Escucha a quienes ya están aprendiendo con el método, a su ritmo y con un camino claro.
        </SectionLead>

        {visibleTestimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-950 px-4 py-12 sm:rounded-2xl sm:py-16">
            <MessageCircle className="mb-4 h-10 w-10 text-slate-500 sm:h-12 sm:w-12" />
            <p className="text-center text-sm text-slate-400 sm:text-base">
              Próximamente testimonios de estudiantes.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {visibleTestimonials.map((testimonial) => (
              <TestimonialVideoCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:mt-12">
          <Link
            href="#elige"
            className={cn(
              'inline-flex min-h-11 w-full max-w-xs items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors sm:min-h-0 sm:w-auto sm:text-base',
              ACCENT_BG
            )}
          >
            Quiero aprender acordeón
          </Link>
        </div>
      </LandingSection>

      <FaqSection />
      <ClosingCtaSection
        ganador={offers.ganador}
        plataforma={offers.plataforma}
        ganadorWhatsappUrl={ganadorWhatsappUrl}
        plataformaWhatsappUrl={plataformaWhatsappUrl}
        questionWhatsappUrl={questionWhatsappUrl}
        userEmail={userEmail}
        whatsappNumber={whatsappNumber}
        isEnrolled={enrolled}
        courseSlug={courseSlug}
      />
      <SiteFooter user={userEmail ? { email: userEmail } : null} />
    </div>
  );
}
