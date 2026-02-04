'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, AlertCircle } from 'lucide-react';

export type MarketingVideoItem = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  embedUrl: string;
  cta_text?: string | null;
  cta_link?: string | null;
};

export function MarketingVideoCard({
  video,
  variant = 'default',
}: {
  video: MarketingVideoItem;
  variant?: 'default' | 'dark';
}) {
  const [open, setOpen] = useState(false);
  const isDark = variant === 'dark';

  return (
    <>
      <Card
        className={cn(
          'overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]',
          isDark &&
          'border-slate-700/50 bg-slate-950 hover:border-blue-500/40 hover:shadow-blue-500/5'
        )}
        onClick={() => setOpen(true)}
      >
        <div className={cn('aspect-video relative', isDark ? 'bg-slate-800' : 'bg-muted')}>
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={cn(
                'w-full h-full flex items-center justify-center',
                isDark ? 'bg-slate-800' : 'bg-muted'
              )}
            >
              <Play
                className={cn(
                  'h-16 w-16 opacity-50',
                  isDark ? 'text-slate-500' : 'text-muted-foreground'
                )}
              />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
            <div className="rounded-full bg-white/90 p-4">
              <Play
                className={cn(
                  'h-8 w-8',
                  isDark ? 'fill-blue-600 text-blue-600' : 'fill-primary text-primary'
                )}
              />
            </div>
          </div>
        </div>
        <CardHeader>
          <CardTitle
            className={cn(
              'text-lg line-clamp-2',
              isDark && 'text-white'
            )}
          >
            {video.title}
          </CardTitle>
          {video.description && (
            <p
              className={cn(
                'text-sm line-clamp-2',
                isDark ? 'text-slate-400' : 'text-muted-foreground'
              )}
            >
              {video.description}
            </p>
          )}
        </CardHeader>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">{video.title}</DialogTitle>
          <div className="aspect-video w-full bg-black">
            {video.embedUrl ? (
              <iframe
                src={video.embedUrl}
                title={video.title}
                className="w-full h-full min-h-[300px]"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center gap-3 text-white/90 p-6">
                <AlertCircle className="h-12 w-12" />
                <p className="text-center font-medium">Video no disponible</p>
                <p className="text-center text-sm text-white/70">
                  Comprueba que el video tenga <code className="bg-white/10 px-1 rounded">video_provider_id</code> en la base de datos y que <code className="bg-white/10 px-1 rounded">BUNNY_LIBRARY_ID</code> esté configurado en el servidor.
                </p>
              </div>
            )}
          </div>
          <div
            className={cn(
              'p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t',
              isDark && 'border-slate-800 bg-slate-950'
            )}
          >
            <h3
              className={cn(
                'font-semibold text-lg',
                isDark && 'text-white'
              )}
            >
              {video.title}
            </h3>
            {video.cta_text && video.cta_link && (
              <Link
                href={video.cta_link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants(),
                  isDark && 'bg-blue-600 hover:bg-blue-500 text-white'
                )}
              >
                {video.cta_text}
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
