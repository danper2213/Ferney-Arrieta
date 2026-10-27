'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { saveWatchPosition } from '@/app/(student)/course/[courseSlug]/lesson/[lessonId]/actions';
import { RESUME_MIN_SECONDS, RESUME_NEAR_END_SECONDS } from '@/lib/student/continue-learning';
import { cn } from '@/lib/utils';

type LessonVideoPlayerProps = {
  lessonId: string;
  courseSlug: string;
  embedUrl: string;
  title: string;
  /** Segundos iniciales (también van en la URL del embed vía `t=`). */
  initialPositionSeconds?: number;
};

type PlayerJsPlayer = {
  on: (event: string, callback: (data?: { seconds?: number; duration?: number }) => void) => void;
  off: (event: string, callback?: (...args: never[]) => void) => void;
  setCurrentTime: (seconds: number) => void;
  getCurrentTime: (callback: (seconds: number) => void) => void;
};

type PlayerJsNamespace = {
  Player: new (iframe: HTMLIFrameElement | string) => PlayerJsPlayer;
};

declare global {
  interface Window {
    playerjs?: PlayerJsNamespace;
  }
}

const PLAYER_JS_SRC = 'https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js';
const SAVE_INTERVAL_MS = 5000;
const SAVE_MIN_DELTA_SECONDS = 5;
const SEEK_SECONDS = 10;

let playerJsPromise: Promise<PlayerJsNamespace> | null = null;

function loadPlayerJs(): Promise<PlayerJsNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window unavailable'));
  }
  if (window.playerjs) {
    return Promise.resolve(window.playerjs);
  }
  if (playerJsPromise) {
    return playerJsPromise;
  }

  playerJsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PLAYER_JS_SRC}"]`
    );
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.playerjs) resolve(window.playerjs);
        else reject(new Error('playerjs no disponible'));
      });
      existing.addEventListener('error', () => reject(new Error('Error cargando playerjs')));
      return;
    }

    const script = document.createElement('script');
    script.src = PLAYER_JS_SRC;
    script.async = true;
    script.onload = () => {
      if (window.playerjs) resolve(window.playerjs);
      else reject(new Error('playerjs no disponible'));
    };
    script.onerror = () => reject(new Error('Error cargando playerjs'));
    document.body.appendChild(script);
  });

  return playerJsPromise;
}

type SeekFlash = 'back' | 'forward' | null;

export function LessonVideoPlayer({
  lessonId,
  courseSlug,
  embedUrl,
  title,
  initialPositionSeconds = 0,
}: LessonVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerJsPlayer | null>(null);
  const lastSavedRef = useRef(initialPositionSeconds);
  const lastSeenRef = useRef(initialPositionSeconds);
  const durationRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [seekFlash, setSeekFlash] = useState<SeekFlash>(null);
  const [playerReady, setPlayerReady] = useState(false);

  const showFlash = useCallback((direction: Exclude<SeekFlash, null>) => {
    setSeekFlash(direction);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setSeekFlash(null), 650);
  }, []);

  const seekBy = useCallback(
    (deltaSeconds: number) => {
      const player = playerRef.current;
      if (!player) return;

      const applySeek = (current: number) => {
        const duration = durationRef.current;
        const next = Math.max(
          0,
          Math.min(duration > 0 ? duration : Number.POSITIVE_INFINITY, current + deltaSeconds)
        );
        player.setCurrentTime(next);
        lastSeenRef.current = next;
        showFlash(deltaSeconds < 0 ? 'back' : 'forward');
      };

      // Preferimos el último timeupdate; si aún no hay, preguntamos al player.
      if (lastSeenRef.current > 0 || initialPositionSeconds > 0) {
        applySeek(lastSeenRef.current || initialPositionSeconds);
        return;
      }

      player.getCurrentTime((current) => {
        applySeek(typeof current === 'number' && Number.isFinite(current) ? current : 0);
      });
    },
    [initialPositionSeconds, showFlash]
  );

  useEffect(() => {
    let cancelled = false;
    let player: PlayerJsPlayer | null = null;

    const persist = (seconds: number, force = false) => {
      const safeSeconds = Math.max(0, Math.floor(seconds));
      if (safeSeconds < RESUME_MIN_SECONDS && !force) return;

      const duration = durationRef.current;
      const nearEnd =
        duration > 0 && safeSeconds >= Math.max(0, duration - RESUME_NEAR_END_SECONDS);
      const positionToSave = nearEnd ? 0 : safeSeconds;

      if (
        !force &&
        Math.abs(positionToSave - lastSavedRef.current) < SAVE_MIN_DELTA_SECONDS
      ) {
        return;
      }

      lastSavedRef.current = positionToSave;
      void saveWatchPosition(lessonId, courseSlug, positionToSave);
    };

    const schedulePersist = (seconds: number) => {
      lastSeenRef.current = seconds;
      if (saveTimerRef.current) return;
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        persist(lastSeenRef.current);
      }, SAVE_INTERVAL_MS);
    };

    const onTimeUpdate = (data?: { seconds?: number; duration?: number }) => {
      if (typeof data?.duration === 'number' && data.duration > 0) {
        durationRef.current = data.duration;
      }
      if (typeof data?.seconds !== 'number') return;
      schedulePersist(data.seconds);
    };

    const onPause = () => {
      persist(lastSeenRef.current, true);
    };

    const onEnded = () => {
      lastSeenRef.current = durationRef.current || lastSeenRef.current;
      persist(0, true);
    };

    const flushOnHide = () => {
      if (document.visibilityState === 'hidden') {
        persist(lastSeenRef.current, true);
      }
    };

    const flushOnUnload = () => {
      persist(lastSeenRef.current, true);
    };

    void (async () => {
      try {
        const playerjs = await loadPlayerJs();
        if (cancelled || !iframeRef.current) return;

        player = new playerjs.Player(iframeRef.current);
        playerRef.current = player;
        player.on('ready', () => {
          if (cancelled) return;
          setPlayerReady(true);
          if (
            initialPositionSeconds >= RESUME_MIN_SECONDS &&
            player?.setCurrentTime
          ) {
            player.setCurrentTime(initialPositionSeconds);
          }
          player?.on('timeupdate', onTimeUpdate);
          player?.on('pause', onPause);
          player?.on('ended', onEnded);
        });
      } catch (error) {
        console.error('LessonVideoPlayer: no se pudo inicializar playerjs', error);
      }
    })();

    document.addEventListener('visibilitychange', flushOnHide);
    window.addEventListener('pagehide', flushOnUnload);

    return () => {
      cancelled = true;
      setPlayerReady(false);
      playerRef.current = null;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
        flashTimerRef.current = null;
      }
      persist(lastSeenRef.current, true);
      document.removeEventListener('visibilitychange', flushOnHide);
      window.removeEventListener('pagehide', flushOnUnload);
      if (player) {
        try {
          player.off('timeupdate');
          player.off('pause');
          player.off('ended');
        } catch {
          // ignore
        }
      }
    };
  }, [lessonId, courseSlug, initialPositionSeconds]);

  // Atajos estilo YouTube: ← / J = -10s, → / L = +10s
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!playerReady) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'j' || event.key === 'J') {
        event.preventDefault();
        seekBy(-SEEK_SECONDS);
      } else if (event.key === 'ArrowRight' || event.key === 'l' || event.key === 'L') {
        event.preventDefault();
        seekBy(SEEK_SECONDS);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playerReady, seekBy]);

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg"
      tabIndex={0}
      aria-label={`Reproductor: ${title}. Flecha izquierda o J retrocede ${SEEK_SECONDS} segundos.`}
    >
      <iframe
        ref={iframeRef}
        title={`Video: ${title}`}
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        loading="eager"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />

      {/* Controles fuera del iframe (Bunny captura los clics internos). */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3 pb-3 pt-10 opacity-100 transition-opacity sm:px-4 sm:pb-4 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          disabled={!playerReady}
          onClick={() => seekBy(-SEEK_SECONDS)}
          className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-lg bg-black/65 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Retroceder ${SEEK_SECONDS} segundos`}
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          {SEEK_SECONDS}s
        </button>
        <button
          type="button"
          disabled={!playerReady}
          onClick={() => seekBy(SEEK_SECONDS)}
          className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-lg bg-black/65 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Adelantar ${SEEK_SECONDS} segundos`}
        >
          {SEEK_SECONDS}s
          <RotateCw className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Feedback visual estilo YouTube al buscar */}
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 z-20 flex w-1/3 items-center justify-center transition-opacity duration-200',
          seekFlash === 'back' ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm">
          <div className="flex flex-col items-center gap-0.5">
            <RotateCcw className="h-5 w-5" />
            <span className="text-xs font-semibold">{SEEK_SECONDS}</span>
          </div>
        </div>
      </div>
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 z-20 flex w-1/3 items-center justify-center transition-opacity duration-200',
          seekFlash === 'forward' ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm">
          <div className="flex flex-col items-center gap-0.5">
            <RotateCw className="h-5 w-5" />
            <span className="text-xs font-semibold">{SEEK_SECONDS}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
