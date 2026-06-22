'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Play, Video } from 'lucide-react';

type LessonVideoMosaicProps = {
  title: string;
  embedUrl: string;
  thumbnailUrl?: string | null;
  className?: string;
  compact?: boolean;
};

export function LessonVideoMosaic({
  title,
  embedUrl,
  thumbnailUrl,
  className,
  compact = false,
}: LessonVideoMosaicProps) {
  const [open, setOpen] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  const showThumbnail = Boolean(thumbnailUrl) && !thumbnailFailed;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group relative w-full overflow-hidden rounded-xl border-0 bg-muted text-left transition-all',
          'hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          compact ? 'max-w-xs' : 'max-w-full',
          className
        )}
        aria-label={`Ver video de ${title}`}
      >
        <div className="relative aspect-video w-full">
          {showThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl!}
              alt={`Vista previa de ${title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              onError={() => setThumbnailFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Video className="h-10 w-10 text-muted-foreground/50 sm:h-12 sm:w-12" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/40">
            <div className="rounded-full bg-primary p-3 shadow-lg ring-4 ring-primary/20 sm:p-3.5">
              <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
        {!compact && (
          <p className="border-t border-border/50 bg-background/80 px-3 py-2.5 text-xs font-medium text-muted-foreground sm:px-4">
            Video de la clase
          </p>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="pr-6">{title}</DialogTitle>
            <DialogDescription>Vista previa del video subido para esta lección.</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              src={embedUrl}
              title={title}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
