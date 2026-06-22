import { createHash } from 'node:crypto';
import { normalizeBunnyVideoId } from './token';

const BUNNY_API_URL = 'https://video.bunnycdn.com';

export type BunnyVideoThumbnailDetails = {
  thumbnailUrl: string | null;
  thumbnailFileName: string | null;
  status: number | null;
};

function normalizeCdnHost(): string {
  return (process.env.BUNNY_CDN_HOSTNAME ?? '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

/** Clave Token Authentication del Pull Zone (CDN → Security). No usar BUNNY_SECURITY_KEY del embed. */
export function getBunnyCdnTokenKey(): string {
  return (process.env.BUNNY_CDN_TOKEN_KEY ?? '').trim();
}

/**
 * Firma rutas del CDN de Bunny (Pull Zone Token Authentication).
 * @see https://docs.bunny.net/cdn/security/token-authentication
 */
export function signBunnyCdnPath(
  path: string,
  expirationSeconds: number = 3600
): string | null {
  const securityKey = getBunnyCdnTokenKey();
  if (!securityKey) return null;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const expires = Math.floor(Date.now() / 1000) + expirationSeconds;
  const hashable = `${securityKey}${normalizedPath}${expires}`;

  const token = createHash('sha256')
    .update(hashable)
    .digest('base64')
    .replace(/\n/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `token=${encodeURIComponent(token)}&expires=${expires}`;
}

export function buildSignedBunnyCdnUrl(
  path: string,
  expirationSeconds: number = 3600
): string | null {
  const cdnHost = normalizeCdnHost();
  if (!cdnHost) return null;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = `https://${cdnHost}${normalizedPath}`;
  const query = signBunnyCdnPath(normalizedPath, expirationSeconds);

  return query ? `${baseUrl}?${query}` : baseUrl;
}

export function signBunnyCdnAbsoluteUrl(
  thumbnailUrl: string,
  expirationSeconds: number = 3600
): string {
  try {
    const url = new URL(thumbnailUrl);
    const query = signBunnyCdnPath(url.pathname, expirationSeconds);
    if (!query) return thumbnailUrl;
    return `${url.origin}${url.pathname}?${query}`;
  } catch {
    return thumbnailUrl;
  }
}

/**
 * Construye la URL del thumbnail desde el CDN de la biblioteca Stream.
 */
export function generateBunnyThumbnailUrl(
  videoId: string,
  expirationSeconds: number = 3600,
  fileName: string = 'thumbnail.jpg'
): { thumbnailUrl: string } | { error: string } {
  const resolvedVideoId = normalizeBunnyVideoId(videoId);
  const cdnHost = normalizeCdnHost();

  if (!cdnHost) {
    return { error: 'BUNNY_CDN_HOSTNAME no configurado' };
  }

  const safeFileName = fileName.replace(/^\/+/, '') || 'thumbnail.jpg';
  const path = `/${resolvedVideoId}/${safeFileName}`;
  const signedUrl = buildSignedBunnyCdnUrl(path, expirationSeconds);

  if (!signedUrl) {
    return { error: 'No se pudo construir la URL del thumbnail' };
  }

  return { thumbnailUrl: signedUrl };
}

export async function fetchBunnyVideoThumbnailDetails(
  videoGuid: string
): Promise<BunnyVideoThumbnailDetails | null> {
  const apiKey = (process.env.BUNNY_API_KEY ?? '').trim();
  const libraryId = (process.env.BUNNY_LIBRARY_ID ?? '').split('#')[0].trim();
  const guid = normalizeBunnyVideoId(videoGuid);

  if (!apiKey || !libraryId || !guid) {
    return null;
  }

  try {
    const res = await fetch(`${BUNNY_API_URL}/library/${libraryId}/videos/${guid}`, {
      headers: {
        Accept: 'application/json',
        AccessKey: apiKey,
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as {
      thumbnailUrl?: string;
      thumbnailFileName?: string;
      status?: number;
    };

    return {
      thumbnailUrl: data.thumbnailUrl?.trim() || null,
      thumbnailFileName: data.thumbnailFileName?.trim() || null,
      status: typeof data.status === 'number' ? data.status : null,
    };
  } catch {
    return null;
  }
}

export async function resolveBunnyVideoThumbnailUrl(
  videoGuid: string
): Promise<string | null> {
  const guid = normalizeBunnyVideoId(videoGuid);
  if (!guid) return null;

  const details = await fetchBunnyVideoThumbnailDetails(guid);

  if (details?.thumbnailUrl) {
    return signBunnyCdnAbsoluteUrl(details.thumbnailUrl);
  }

  if (details?.thumbnailFileName) {
    const fromFile = generateBunnyThumbnailUrl(guid, 3600, details.thumbnailFileName);
    if ('thumbnailUrl' in fromFile) return fromFile.thumbnailUrl;
  }

  const fromCdn = generateBunnyThumbnailUrl(guid);
  if ('thumbnailUrl' in fromCdn) return fromCdn.thumbnailUrl;

  return null;
}
