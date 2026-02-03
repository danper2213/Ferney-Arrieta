'use server';

import { createHash } from 'node:crypto';

const BUNNY_API_URL = 'https://video.bunnycdn.com';

type CreateVideoResponse = {
  guid: string;
  title: string;
  libraryId: number;
};

export type CreateVideoEntryResult =
  | { success: true; guid: string; signature: string; expirationTime: number; libraryId: string }
  | { success: false; error: string };

/**
 * Crea un video en Bunny Stream y devuelve el guid más la firma presignada
 * para que el cliente pueda subir el archivo por TUS sin exponer la API Key.
 */
export async function createVideoEntry(title: string): Promise<CreateVideoEntryResult> {
  const apiKey = process.env.BUNNY_API_KEY;
  const libraryId = process.env.BUNNY_LIBRARY_ID;

  if (!apiKey || !libraryId) {
    return {
      success: false,
      error: 'Bunny Stream no está configurado (BUNNY_API_KEY o BUNNY_LIBRARY_ID faltan)',
    };
  }

  const trimmedTitle = (title || 'Untitled Video').trim().slice(0, 256);

  try {
    const createRes = await fetch(`${BUNNY_API_URL}/library/${libraryId}/videos`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        AccessKey: apiKey,
      },
      body: JSON.stringify({ title: trimmedTitle }),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error('Bunny create video failed:', createRes.status, text);
      return {
        success: false,
        error: 'No se pudo crear el video en Bunny Stream',
      };
    }

    const video = (await createRes.json()) as CreateVideoResponse;
    const videoId = video.guid;

    // Firma presignada: SHA256(library_id + api_key + expiration_time + video_id)
    const expirationTime = Math.floor(Date.now() / 1000) + 86400; // 24 horas
    const signatureString = `${libraryId}${apiKey}${expirationTime}${videoId}`;
    const signature = createHash('sha256').update(signatureString).digest('hex');

    return {
      success: true,
      guid: videoId,
      signature,
      expirationTime,
      libraryId,
    };
  } catch (err) {
    console.error('createVideoEntry error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al crear el video',
    };
  }
}
