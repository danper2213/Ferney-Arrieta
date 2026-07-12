'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, AlertCircle } from 'lucide-react';

export type TestimonialVideoItem = {
  id: string;
  person_name: string;
  country: string;
  description?: string | null;
  thumbnail_url?: string | null;
  embedUrl: string;
};

export function TestimonialVideoCard({
  testimonial,
}: {
  testimonial: TestimonialVideoItem;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="group cursor-pointer overflow-hidden border-slate-700/50 bg-slate-950 transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5"
        onClick={() => setOpen(true)}
      >
        <div className="relative aspect-video bg-slate-800">
          {testimonial.thumbnail_url ? (
            <img
              src={testimonial.thumbnail_url}
              alt={`Testimonio de ${testimonial.person_name}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800">
              <Play className="h-16 w-16 text-slate-500 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
            <div className="rounded-full bg-white/90 p-3 shadow-lg sm:p-4">
              <Play className="h-7 w-7 fill-blue-600 text-blue-600 sm:h-8 sm:w-8" />
            </div>
          </div>
        </div>

        <CardContent className="space-y-3 p-4 sm:p-5">
          {testimonial.description && (
            <p className="text-sm leading-relaxed text-slate-300 line-clamp-3">
              {testimonial.description}
            </p>
          )}
          <div>
            <p className="font-semibold text-white">{testimonial.person_name}</p>
            <p className="text-sm text-slate-400">{testimonial.country}</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-4xl gap-0 overflow-hidden p-0 sm:w-full">
          <DialogTitle className="sr-only">
            Testimonio de {testimonial.person_name}
          </DialogTitle>
          <div className="aspect-video w-full bg-black">
            {testimonial.embedUrl ? (
              <iframe
                src={testimonial.embedUrl}
                title={`Testimonio de ${testimonial.person_name}`}
                className="h-full w-full min-h-[180px] sm:min-h-[300px]"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 p-6 text-white/90 sm:min-h-[300px]">
                <AlertCircle className="h-12 w-12" />
                <p className="text-center font-medium">Video no disponible</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white sm:text-lg">
                {testimonial.person_name}
              </h3>
              <p className="text-sm text-slate-400">{testimonial.country}</p>
              {testimonial.description && (
                <p className="mt-2 max-w-xl text-sm text-slate-300 line-clamp-4 sm:line-clamp-none">
                  {testimonial.description}
                </p>
              )}
            </div>
            <Link
              href="/#programas"
              className={cn(
                buttonVariants(),
                'min-h-11 w-full shrink-0 bg-blue-600 text-white hover:bg-blue-500 sm:min-h-0 sm:w-auto'
              )}
              onClick={() => setOpen(false)}
            >
              Ver programas
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
