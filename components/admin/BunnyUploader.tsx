'use client';

import { useRef, useState } from 'react';
import * as tus from 'tus-js-client';
import { toast } from 'sonner';
import { createVideoEntry } from '@/app/actions/bunny';
import { updateLessonVideo } from '@/app/(admin)/admin/courses/[courseId]/actions';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

const TUS_ENDPOINT = 'https://video.bunnycdn.com/tusupload';

type BunnyUploaderProps = {
  lessonId: string;
  lessonTitle?: string;
  disabled?: boolean;
  className?: string;
};

export function BunnyUploader({ lessonId, lessonTitle = '', disabled, className }: BunnyUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Por favor selecciona un archivo de video');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const title = lessonTitle.trim() || file.name || 'Untitled Video';

    const result = await createVideoEntry(title);

    if (!result.success) {
      setUploading(false);
      toast.error(result.error || 'Error al crear el video');
      setError(result.error ?? null);
      e.target.value = '';
      return;
    }

    const { guid, signature, expirationTime, libraryId } = result;

    return new Promise<void>((resolve, reject) => {
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
          e.target.value = '';
          reject(err);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const pct = bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0;
          setProgress(pct);
        },
        onSuccess: async () => {
          const updateResult = await updateLessonVideo(lessonId, guid);
          setUploading(false);
          setProgress(100);
          e.target.value = '';

          if (updateResult.error) {
            setError(updateResult.error);
            toast.error(updateResult.error);
            reject(new Error(updateResult.error));
            return;
          }

          setError(null);
          toast.success('Video subido correctamente');
          resolve();
        },
      });

      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    });
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id={`bunny-upload-${lessonId}`}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
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
            Subir video
          </>
        )}
      </Button>

      {uploading && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && !uploading && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
