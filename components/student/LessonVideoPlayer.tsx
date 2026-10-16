'use client';

import { useEffect, useRef } from 'react';
import { saveWatchPosition } from '@/app/(student)/course/[courseSlug]/lesson/[lessonId]/actions';
import { RESUME_MIN_SECONDS, RESUME_NEAR_END_SECONDS } from '@/lib/student/continue-learning';

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

export function LessonVideoPlayer({
  lessonId,
  courseSlug,
  embedUrl,
  title,
  initialPositionSeconds = 0,
}: LessonVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastSavedRef = useRef(initialPositionSeconds);
  const lastSeenRef = useRef(initialPositionSeconds);
  const durationRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let player: PlayerJsPlayer | null = null;

    const persist = (seconds: number, force = false) => {
      const safeSeconds = Math.max(0, Math.floor(seconds));
      if (safeSeconds < RESUME_MIN_SECONDS && !force) return;

      const duration = durationRef.current;
      // Cerca del final: guardar 0 para que "continuar" no reabra casi acabada
      // si el usuario marca como vista; el progreso de visionado igual actualiza last_watched_at.
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
        player.on('ready', () => {
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
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
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

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
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
    </div>
  );
}
