'use client';

import { useRef, useState } from 'react';
import * as tus from 'tus-js-client';
import { toast } from 'sonner';
import { createVideoEntry } from '@/app/actions/bunny';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle2, Film } from 'lucide-react';

const TUS_ENDPOINT = 'https://video.bunnycdn.com/tusupload';

type BunnyDirectUploaderProps = {
  videoTitle: string;
  currentVideoId?: string | null;
  onUploaded: (guid: string) => void;
  disabled?: boolean;
};

export function BunnyDirectUploader({
  videoTitle,
  currentVideoId,
  onUploaded,
  disabled,
}: BunnyDirectUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedId, setUploadedId] = useState<string | null>(currentVideoId ?? null);
  const [error, setError] = useState<string | null>(null);

  const activeVideoId = uploadedId ?? currentVideoId ?? null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Selecciona un archivo de video');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const title = videoTitle.trim() || file.name || 'Testimonio';
    const result = await createVideoEntry(title);

    if (!result.success) {
      setUploading(false);
      setError(result.error ?? 'Error al preparar la subida');
      toast.error(result.error ?? 'Error al preparar la subida');
      event.target.value = '';
      return;
    }

    const { guid, signature, expirationTime, libraryId } = result;

    const upload = new tus.Upload(file, {
      endpoint: TUS_ENDPOINT,
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expirationTime),
        VideoId: guid,
        LibraryId: libraryId,
      },
      metadata: {
        filetype: file.type,
        title: file.name,
      },
      onError: (err) => {
        setUploading(false);
        setProgress(0);
        const message = err?.message || 'Error al subir el video';
        setError(message);
        toast.error(message);
        event.target.value = '';
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const pct = bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0;
        setProgress(pct);
      },
      onSuccess: () => {
        setUploading(false);
        setProgress(100);
        setUploadedId(guid);
        setError(null);
        onUploaded(guid);
        toast.success('Video subido correctamente');
        event.target.value = '';
      },
    });

    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-dashed p-4">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      {activeVideoId && !uploading ? (
        <div className="flex items-start gap-3 rounded-md bg-muted/50 p-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Video listo para guardar</p>
            <p className="truncate text-xs text-muted-foreground">{activeVideoId}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            Reemplazar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Film className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Video del testimonio</p>
            <p className="text-xs text-muted-foreground">
              Sube el video del estudiante (MP4, MOV, etc.)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo {progress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Seleccionar video
              </>
            )}
          </Button>
        </div>
      )}

      {uploading && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && !uploading && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
