import { ProgramViewPage } from '@/components/landing/ProgramViewPage';
import { FeaturedCourseCard } from '@/components/landing/FeaturedCourseCard';
import type { CoursePlan } from '@/lib/course-plans';

export type FeaturedCourseItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  payment_link: string | null;
  programContent: string;
};

type FeaturedProgramsListProps = {
  courses: FeaturedCourseItem[];
  resolvePlans: (course: FeaturedCourseItem) => CoursePlan[];
  enrolledCourseIds: string[];
  userEmail: string | null;
  whatsappNumber: string;
  buildWhatsAppUrl: (title: string) => string;
  accentBg: string;
};

export function FeaturedProgramsList({
  courses,
  resolvePlans,
  enrolledCourseIds,
  userEmail,
  whatsappNumber,
  buildWhatsAppUrl,
  accentBg,
}: FeaturedProgramsListProps) {
  return (
    <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
      {courses.map((course, index) => {
        const plans = resolvePlans(course);
        const isEnrolled = enrolledCourseIds.includes(course.id);

        return (
          <div key={course.id} className="relative">
            <div className="mb-3 flex items-center gap-3 px-1 sm:mb-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-300 ring-1 ring-blue-500/30">
                {index + 1}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Programa {index + 1}
              </span>
            </div>

            {plans.length > 0 ? (
              <ProgramViewPage
                course={course}
                plans={plans}
                isEnrolled={isEnrolled}
                userEmail={userEmail}
                whatsappNumber={whatsappNumber}
              />
            ) : (
              <FeaturedCourseCard
                course={course}
                isEnrolled={isEnrolled}
                userEmail={userEmail}
                whatsappNumber={whatsappNumber}
                whatsappUrl={buildWhatsAppUrl(course.title)}
                accentBg={accentBg}
                imageOnRight={index % 2 === 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
