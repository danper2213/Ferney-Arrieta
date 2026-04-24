import { createHash } from 'node:crypto';

function normalizeLibraryId(): string {
  return (process.env.BUNNY_LIBRARY_ID ?? '').split('#')[0].trim();
}

/**
 * Host del iframe: el reproductor actual usa `player.mediadelivery.net` (docs Bunny Stream).
 * `iframe.mediadelivery.net` sigue existiendo para bibliotecas legacy; si hace falta, sobreescribe con BUNNY_EMBED_HOST.
 */
function embedBaseUrl(libraryId: string, videoId: string): string {
  const host = (process.env.BUNNY_EMBED_HOST ?? 'player.mediadelivery.net').replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${host}/embed/${libraryId}/${videoId}`;
}

/**
 * Genera un token firmado para embeber videos de Bunny Stream de forma segura.
 * Fórmula oficial: SHA256_HEX(token_security_key + video_id + expiration)
 * @see https://docs.bunny.net/stream/token-authentication
 *
 * @param videoId - El GUID del video en Bunny Stream
 * @param expirationSeconds - Segundos hasta que expire el token (default: 3600 = 1 hora)
 * @returns Objeto con token, expires (timestamp) y la URL completa de embed
 */
export function generateBunnyToken(
  videoId: string,
  expirationSeconds: number = 3600
): { token: string; expires: number; embedUrl: string } | { error: string } {
  const securityKey = (process.env.BUNNY_SECURITY_KEY ?? '').trim();
  const libraryId = normalizeLibraryId();

  if (!libraryId) {
    return { error: 'BUNNY_LIBRARY_ID no está configurada' };
  }

  const baseUrl = embedBaseUrl(libraryId, videoId);

  // Sin clave de firma: embed sin token (solo válido si "Embed view token authentication" está desactivado en Bunny)
  if (!securityKey) {
    const expires = 0;
    return {
      token: '',
      expires,
      embedUrl: baseUrl,
    };
  }

  // Timestamp de expiración en segundos (UNIX timestamp)
  const expires = Math.floor(Date.now() / 1000) + expirationSeconds;

  // Generar token: SHA256(security_key + video_id + expires)
  const signatureString = `${securityKey}${videoId}${expires}`;
  const token = createHash('sha256').update(signatureString).digest('hex');

  const embedUrl = `${baseUrl}?token=${encodeURIComponent(token)}&expires=${expires}`;

  return {
    token,
    expires,
    embedUrl,
  };
}
