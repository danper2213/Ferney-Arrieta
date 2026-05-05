import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { generateBunnyToken } from '@/lib/bunny/token';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingVideoCard } from '@/components/landing/MarketingVideoCard';
import { PaymentModal } from '@/components/landing/PaymentModal';
import {
  ArrowRight,
  BookOpen,
  Play,
  Music,
  Brain,
  Users,
  TrendingUp,
  Check,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Revalidar la landing cada 60 segundos
export const revalidate = 60;

// Color de acento: azul profesional (#2563EB = blue-600)
const ACCENT = 'text-blue-400';
const ACCENT_BG = 'bg-blue-600 hover:bg-blue-500';
const ACCENT_BORDER = 'border-blue-500/50';

// Imagen de fondo del Hero (`public/welcome.png`)
const HERO_BG_IMAGE = '/welcome.png';

/** Márgenes horizontales y ancho máx. alineados con «Programas destacados» */
const LANDING_SECTION_INNER =
  'container mx-auto max-w-6xl px-3 sm:px-4 md:px-6';
/** Padding vertical homogéneo entre secciones */
const LANDING_SECTION_Y = 'py-12 sm:py-16 md:py-20';

function buildWhatsAppUrl(courseTitle: string, whatsappNumber: string): string {
  const num = (whatsappNumber || (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '')).replace(/\D/g, '');
  if (!num) return '#';
  const message = `Hola, estoy interesado en el curso ${courseTitle} que vi en la web. ¿Me podrías enviar el link de pago de Bold?`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

const FEATURES = [
  {
    icon: Music,
    title: 'Técnica Sólida',
    description:
      'Programas estructurados paso a paso para consolidar bases que perduran.',
  },
  {
    icon: Brain,
    title: 'Mentalidad Ganadora',
    description:
      'Desarrolla la mentalidad que necesitas para destacar tanto en el escenario como en la vida.',
  },
  {
    icon: Users,
    title: 'Comunidad Exclusiva',
    description:
      'Forma parte de una comunidad de acordeonistas que comparten tu misma pasión y objetivos.',
  },
  {
    icon: TrendingUp,
    title: 'Resultados Reales',
    description:
      'Metodología probada que combina técnica y mindset para que veas avances medibles.',
  },
];

const METHOD_BENEFITS = [
  'Ejercicios paso a paso para todos los niveles',
  'Soporte continuo y seguimiento personalizado',
  'Acceso de por vida a los programas',
  'Combinación de técnica y desarrollo personal',
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: courses = [] } = await supabase
    .from('courses')
    .select('id, title, slug, description, thumbnail_url, payment_link')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const { data: marketingVideosRaw = [] } = await supabase
    .from('marketing_videos')
    .select('*')
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
  const marketingVideos = (marketingVideosRaw ?? []).map((video) => {
    const providerId = (video as { video_provider_id?: string }).video_provider_id;
    const tokenResult = providerId ? generateBunnyToken(providerId, 3600) : null;
    const signedUrl = tokenResult && 'embedUrl' in tokenResult ? tokenResult.embedUrl : '';
    const embedUrl =
      signedUrl ||
      (providerId && libraryId
        ? `https://player.mediadelivery.net/embed/${libraryId}/${providerId}`
        : '');
    return {
      id: (video as { id: string }).id,
      title: (video as { title: string }).title,
      description: (video as { description?: string }).description ?? null,
      thumbnail_url: (video as { thumbnail_url?: string }).thumbnail_url ?? null,
      embedUrl,
      cta_text: (video as { cta_text?: string }).cta_text ?? null,
      cta_link: (video as { cta_link?: string }).cta_link ?? null,
    };
  });

  const courseList = (courses ?? []) as {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string | null;
    payment_link: string | null;
  }[];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ——— Hero: welcome completa en cualquier pantalla (object-contain) ——— */}
      <section className="relative isolate box-border h-[100svh] min-h-[320px] w-full overflow-hidden bg-black">
        <div className="absolute inset-6 sm:inset-10 md:inset-14 lg:inset-[4.5rem]">
          <Image
            src={HERO_BG_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-contain object-center"
          />
        </div>
      </section>

      {/* ——— Nuestros Programas Destacados ——— */}
      <section
        id="programas"
        className={cn('border-t border-slate-800/80 bg-slate-900', LANDING_SECTION_Y)}
      >
        <div className={LANDING_SECTION_INNER}>
          <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Nuestros Programas Destacados
          </h2>
          <p className="mx-auto mb-8 max-w-2xl px-1 text-center text-sm text-slate-400 sm:mb-10 sm:text-base md:mb-12">
            Cursos diseñados para llevarte paso a paso desde lo básico hasta el nivel que buscas.
          </p>

          {courseList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-950 py-12 sm:rounded-2xl sm:py-14">
              <BookOpen className="mb-3 h-10 w-10 text-slate-500 sm:h-12 sm:w-12" />
              <p className="text-sm text-slate-400 sm:text-base">Próximamente nuevos programas.</p>
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-3">
              {courseList.map((course) => {
                const isEnrolled = enrolledCourseIds.includes(course.id);
                return (
                  <Card
                    key={course.id}
                    className={cn(
                      'flex w-full flex-col overflow-hidden border-slate-700/50 bg-slate-950 transition-all hover:border-blue-500/40',
                      ACCENT_BORDER
                    )}
                  >
                    <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-800 sm:aspect-[5/3]">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BookOpen className="h-10 w-10 text-slate-600 sm:h-12 sm:w-12" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="space-y-1 p-3 pb-2 sm:p-4 sm:pb-2">
                      <CardTitle className="text-base font-semibold leading-snug text-white line-clamp-2 sm:text-lg">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3 p-3 pt-0 sm:gap-3 sm:p-4 sm:pt-0">
                      <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-slate-400 sm:line-clamp-3 sm:text-sm">
                        {course.description}
                      </p>
                      {isEnrolled ? (
                        <Link
                          href={`/course/${course.slug}`}
                          className={cn(
                            'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors sm:py-2.5',
                            ACCENT_BG
                          )}
                        >
                          Ir al Aula
                          <span aria-hidden>▶️</span>
                        </Link>
                      ) : course.payment_link?.trim() ? (
                        <PaymentModal
                          courseTitle={course.title}
                          paymentLink={course.payment_link}
                          userEmail={user?.email ?? null}
                          whatsappNumber={whatsappNumber || null}
                          triggerClassName="px-3 py-2 text-sm sm:py-2.5"
                        />
                      ) : (
                        <a
                          href={buildWhatsAppUrl(course.title, whatsappNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#20BD5A] sm:py-2.5"
                        >
                          <MessageCircle className="h-4 w-4 shrink-0" />
                          Comprar por WhatsApp
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ——— Lo Que Nos Hace Diferentes ——— */}
      <section className={cn('bg-slate-900', LANDING_SECTION_Y)}>
        <div className={LANDING_SECTION_INNER}>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Lo Que Nos Hace Diferentes
          </h2>
          <p className="mx-auto mb-14 max-w-2xl text-center text-slate-400 text-lg">
            Una combinación única de técnica y mentalidad para que llegues más lejos.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className={cn(
                  'border-slate-700/50 bg-slate-950 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5',
                  ACCENT_BORDER
                )}
              >
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg text-white">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Sobre el Método (Imagen + Texto) ——— */}
      <section className={cn('bg-black', LANDING_SECTION_Y)}>
        <div className={LANDING_SECTION_INNER}>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Opcional: añade tu foto con style={{ backgroundImage: 'url(/instructor.jpg)' }} en el div interior */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
              <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 ring-4 ring-blue-500/30">
                  <Music className="h-12 w-12" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 h-1 rounded-full bg-blue-500/60" />
              </div>
            </div>
            <div className="space-y-6">
              <p className={cn('text-sm font-semibold uppercase tracking-widest', ACCENT)}>
                Método comprobado
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Más que notas, formamos músicos completos.
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Combinamos la técnica del acordeón con el desarrollo de una mentalidad
                ganadora. No se trata solo de tocar bien: se trata de crecer como
                persona y artista, con programas que te llevan paso a paso desde lo
                básico hasta el nivel que buscas.
              </p>
              <ul className="space-y-3">
                {METHOD_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                href="#programas"
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium text-white transition-colors',
                  ACCENT_BG
                )}
              >
                Ver Nuestros Cursos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Contenido Gratuito (Videos) ——— */}
      <section className={cn('border-t border-slate-800 bg-slate-950', LANDING_SECTION_Y)}>
        <div className={LANDING_SECTION_INNER}>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Contenido Gratuito
          </h2>
          <p className="mx-auto mb-14 max-w-2xl text-center text-slate-400 text-lg">
            Videos destacados para que conozcas nuestro estilo y empieces a disfrutar del aprendizaje.
          </p>

          {marketingVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-900 py-16">
              <Play className="mb-4 h-12 w-12 text-slate-500" />
              <p className="text-slate-400">Próximamente más contenido gratuito.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {marketingVideos
                .filter((v) => v.embedUrl)
                .map((video) => (
                  <MarketingVideoCard key={video.id} video={video} variant="dark" />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* ——— Footer ——— */}
      <footer className={cn('border-t border-slate-800 bg-black', LANDING_SECTION_Y)}>
        <div className={LANDING_SECTION_INNER}>
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-4">
              <Link href="/" className="inline-block" aria-label="Inicio">
                <Image
                  src="/logo.png"
                  alt="Comunidad de Acordeoneros"
                  width={160}
                  height={40}
                  className="h-8 w-auto object-contain brightness-0 invert opacity-90"
                />
              </Link>
              <p className="max-w-xs text-sm text-slate-400">
                Programas de acordeón y mentalidad para que llegues más lejos.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 sm:gap-12">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Enlaces
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                      Inicio
                    </Link>
                  </li>
                  <li>
                    <Link href="/#programas" className="text-slate-400 hover:text-white transition-colors">
                      Cursos
                    </Link>
                  </li>
                  <li>
                    <Link href="/#programas" className="text-slate-400 hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Redes
                </h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Comunidad de Acordeoneros. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              {user ? (
                <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    Iniciar sesión
                  </Link>
                  <Link href="/register" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}