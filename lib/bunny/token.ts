import { createHash } from 'node:crypto';

/**
 * Genera un token firmado para embeber videos de Bunny Stream de forma segura.
 * Fórmula: SHA256(security_key + video_id + expiration_timestamp)
 *
 * @param videoId - El GUID del video en Bunny Stream
 * @param expirationSeconds - Segundos hasta que expire el token (default: 3600 = 1 hora)
 * @returns Objeto con token, expires (timestamp) y la URL completa de embed
 */
export function generateBunnyToken(
  videoId: string,
  expirationSeconds: number = 3600
): { token: string; expires: number; embedUrl: string } | { error: string } {
  const securityKey = process.env.BUNNY_SECURITY_KEY;
  const libraryId = process.env.BUNNY_LIBRARY_ID;

  if (!securityKey) {
    return { error: 'BUNNY_SECURITY_KEY no está configurada' };
  }

  if (!libraryId) {
    return { error: 'BUNNY_LIBRARY_ID no está configurada' };
  }

  // Timestamp de expiración en segundos (UNIX timestamp)
  const expires = Math.floor(Date.now() / 1000) + expirationSeconds;

  // Generar token: SHA256(security_key + video_id + expires)
  const signatureString = `${securityKey}${videoId}${expires}`;
  const token = createHash('sha256').update(signatureString).digest('hex');

  // Construir URL de embed segura
  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`;

  return {
    token,
    expires,
    embedUrl,
  };
}
