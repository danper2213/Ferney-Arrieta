'use client';

import { useEffect, useId, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HERO_BG_VIDEO = '/hero-background.mp4';
const TEXT_COLOR = '#ffffff';

/** Textos fijos del hero — no alterar */
const WELCOME_TEXT = 'BIENVENIDO AL PROGRAMA';
const TITLE_TEXT = 'DOMINA EL ACORDEON';
const SUBTITLE_TEXT = 'DOMINA TU VIDA';

function HeroCopy() {
  const uid = useId().replace(/:/g, '');
  const welcomePath = `welcome-${uid}`;
  const titlePath = `title-${uid}`;
  const subtitlePath = `subtitle-${uid}`;

  const heroFont = {
    fontFamily: 'var(--font-bowlby), system-ui, sans-serif',
    fontWeight: 400,
  } as const;

  return (
    <div className="hero-text-reveal relative flex h-full min-w-0 flex-1 flex-col items-center justify-center">
      <svg
        viewBox="0 0 1600 420"
        className="h-full w-full max-h-full overflow-visible"
        role="img"
        aria-labelledby="hero-title"
        preserveAspectRatio="xMidYMid meet"
      >
        <title>Domina el acordeón — Domina tu vida</title>
        <defs>
          <path id={welcomePath} d="M 120 78 Q 800 -8 1480 78" fill="none" />
          <path id={titlePath} d="M 30 205 Q 800 95 1570 205" fill="none" />
          <path id={subtitlePath} d="M 30 325 Q 800 215 1570 325" fill="none" />
        </defs>

        <text
          fill="none"
          stroke="#2563eb"
          strokeWidth="48"
          strokeLinejoin="round"
          strokeLinecap="round"
          fontSize="78"
          letterSpacing="0.01em"
          style={heroFont}
        >
          <textPath href={`#${welcomePath}`} startOffset="50%" textAnchor="middle">
            {WELCOME_TEXT}
          </textPath>
        </text>
        <text fill="#ffffff" fontSize="78" letterSpacing="0.01em" style={heroFont}>
          <textPath href={`#${welcomePath}`} startOffset="50%" textAnchor="middle">
            {WELCOME_TEXT}
          </textPath>
        </text>

        <text
          id="hero-title"
          fill={TEXT_COLOR}
          fontSize="102"
          letterSpacing="0"
          style={{
            ...heroFont,
            filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.3))',
          }}
        >
          <textPath href={`#${titlePath}`} startOffset="50%" textAnchor="middle">
            {TITLE_TEXT}
          </textPath>
        </text>

        <text
          fill={TEXT_COLOR}
          fontSize="102"
          letterSpacing="0"
          style={{
            ...heroFont,
            filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.3))',
          }}
        >
          <textPath href={`#${subtitlePath}`} startOffset="50%" textAnchor="middle">
            {SUBTITLE_TEXT}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

/** Mitades del acordeón: visibles también en móvil, con tamaño fluido */
const accordionBox =
  'relative shrink-0 self-center ' +
  'h-[min(22vh,160px)] w-[min(9vh,64px)] ' +
  'sm:h-[min(34vh,260px)] sm:w-[min(13vh,110px)] ' +
  'md:h-[min(40vh,320px)] md:w-[min(15vh,135px)] ' +
  'lg:h-[min(46vh,380px)] lg:w-[min(17vh,160px)]';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play()?.catch(() => {});
  }, []);

  return (
    <section
      className="relative isolate flex min-h-[100svh] w-full max-w-[100vw] items-center justify-center overflow-x-hidden bg-zinc-950 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,calc(env(safe-area-inset-top)+2rem))] sm:px-4 sm:pt-10 md:px-6"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero-video-ken-burns absolute inset-0 h-full w-full object-cover object-center opacity-30"
          src={HERO_BG_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/88" />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(50vh,420px)] w-[min(90vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center py-2 sm:-translate-y-4 md:-translate-y-8">
        <Image
          src="/logo.png"
          alt="Comunidad de Acordeoneros"
          width={980}
          height={250}
          priority
          className="hero-text-reveal mb-2 h-[clamp(3.25rem,14vw,7rem)] w-auto max-w-[min(92vw,560px)] object-contain drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] sm:mb-3 sm:h-[clamp(5rem,16vw,9rem)] sm:max-w-[min(88vw,720px)] md:mb-4 md:h-[clamp(6.5rem,12vw,11rem)] md:max-w-[860px] lg:h-[12.5rem] lg:max-w-[980px]"
        />

        <div className="flex w-full max-w-full items-center justify-center gap-0 px-0 sm:px-1">
          <div className={`hero-half-left ${accordionBox} -mr-3 sm:-mr-6 md:-mr-10 lg:-mr-14`}>
            <div className="hero-accordion-motion hero-accordion-motion-left relative h-full w-full">
              <Image
                src="/images/accordion-left.png"
                alt="Corona III"
                fill
                priority
                sizes="(max-width: 640px) 64px, (max-width: 768px) 110px, 160px"
                className="object-contain object-right grayscale drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
              />
            </div>
          </div>

          <div className="h-[clamp(7.5rem,28vh,240px)] min-w-0 flex-1 sm:h-[min(32vh,240px)] md:h-[min(38vh,300px)] lg:h-[min(44vh,360px)]">
            <HeroCopy />
          </div>

          <div className={`hero-half-right ${accordionBox} -ml-3 sm:-ml-6 md:-ml-10 lg:-ml-14`}>
            <div className="hero-accordion-motion hero-accordion-motion-right relative h-full w-full">
              <Image
                src="/images/accordion-right.png"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 64px, (max-width: 768px) 110px, 160px"
                className="object-contain object-left grayscale drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div className="hero-cta-enter mt-4 flex w-full max-w-sm flex-col items-stretch gap-2.5 px-1 sm:mt-6 sm:max-w-none sm:items-center sm:gap-3.5">
          <Link
            href="#programas"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_0_24px_rgba(37,99,235,0.45)] transition-all duration-300 hover:bg-blue-500 active:scale-[0.98] sm:min-h-0 sm:px-10 sm:py-3.5 sm:text-base sm:hover:scale-105"
          >
            Ver programas
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 bg-white/10 px-6 py-2.5 text-sm font-semibold tracking-wide text-white shadow-[0_0_24px_rgba(255,255,255,0.12)] backdrop-blur-md transition-all duration-300 hover:border-white/55 hover:bg-white/20 active:scale-[0.98] sm:min-h-0 sm:px-10 sm:py-3 sm:text-base sm:hover:scale-[1.03]"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
