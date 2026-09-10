'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HERO_BG_VIDEO = '/hero-background.mp4';

const accordionBox =
  'relative h-[min(28vh,220px)] w-[min(11vh,88px)] sm:h-[min(36vh,280px)] sm:w-[min(14vh,120px)] md:h-[min(42vh,340px)] md:w-[min(16vh,150px)]';

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
      id="inicio"
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

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center py-2 sm:-translate-y-2">
        <Image
          src="/logo.png"
          alt="Comunidad de Acordeoneros"
          width={980}
          height={250}
          priority
          className="hero-text-reveal mb-4 h-[clamp(3.25rem,14vw,7rem)] w-auto max-w-[min(92vw,560px)] object-contain drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] sm:mb-5 sm:h-[clamp(5rem,16vw,9rem)] sm:max-w-[min(88vw,720px)] md:mb-6 md:h-[clamp(6.5rem,12vw,11rem)] md:max-w-[860px] lg:h-[12.5rem] lg:max-w-[980px]"
        />

        <div className="flex w-full max-w-full items-center justify-center gap-0">
          <div className={`hero-half-left hidden shrink-0 sm:block ${accordionBox} -mr-4 md:-mr-8 lg:-mr-12`}>
            <div className="hero-accordion-motion hero-accordion-motion-left relative h-full w-full">
              <Image
                src="/images/accordion-left.png"
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 88px, 150px"
                className="object-contain object-right grayscale drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="hero-text-reveal min-w-0 max-w-3xl flex-1 px-1 text-center sm:px-2">
            <h1
              id="hero-title"
              className="text-balance text-[1.65rem] font-bold uppercase leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
              style={{ textShadow: '0 0 18px rgba(255,255,255,0.22)' }}
            >
              Aprende a tocar acordeón a tu ritmo, aunque tengas poco tiempo
            </h1>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-200 sm:mt-5 sm:text-base md:text-lg">
              Un método diseñado para personas adultas que quieren aprender acordeón de manera
              organizada, con un paso a paso. Un sistema creado para mayores de edad.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-100 sm:text-base md:text-lg">
              Empieza desde cero o mejora lo que ya sabes.
            </p>
          </div>

          <div className={`hero-half-right hidden shrink-0 sm:block ${accordionBox} -ml-4 md:-ml-8 lg:-ml-12`}>
            <div className="hero-accordion-motion hero-accordion-motion-right relative h-full w-full">
              <Image
                src="/images/accordion-right.png"
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 88px, 150px"
                className="object-contain object-left grayscale drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div className="hero-cta-enter mt-6 flex w-full max-w-sm flex-col items-stretch gap-2.5 px-1 sm:mt-8 sm:max-w-none sm:items-center sm:gap-3.5">
          <Link
            href="#conseguir"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_0_24px_rgba(37,99,235,0.45)] transition-all duration-300 hover:bg-blue-500 active:scale-[0.98] sm:min-h-0 sm:px-10 sm:py-3.5 sm:text-base sm:hover:scale-105"
          >
            Quiero aprender acordeón
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
