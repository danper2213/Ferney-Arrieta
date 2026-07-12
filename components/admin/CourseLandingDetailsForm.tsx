'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { updateCourseLandingDetails } from '@/app/(admin)/admin/courses/[courseId]/course-landing-actions';
import { ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

type CourseLandingDetailsFormProps = {
  courseId: string;
  initialTitle: string;
  initialDescription: string;
  initialThumbnailUrl: string | null;
  initialPaymentLink: string | null;
};

export function CourseLandingDetailsForm({
  courseId,
  initialTitle,
  initialDescription,
  initialThumbnailUrl,
  initialPaymentLink,
}: CourseLandingDetailsFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialThumbnailUrl ?? '');
  const [paymentLink, setPaymentLink] = useState(initialPaymentLink ?? '');
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setThumbnailUrl(initialThumbnailUrl ?? '');
    setPaymentLink(initialPaymentLink ?? '');
  }, [initialTitle, initialDescription, initialThumbnailUrl, initialPaymentLink]);

  const hasChanges =
    title.trim() !== initialTitle.trim() ||
    description.trim() !== initialDescription.trim() ||
    thumbnailUrl.trim() !== (initialThumbnailUrl ?? '').trim() ||
    paymentLink.trim() !== (initialPaymentLink ?? '').trim();

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) {
        toast.error('Error al subir la imagen');
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('thumbnails').getPublicUrl(data.path);
      setThumbnailUrl(publicUrl);
      toast.success('Imagen subida');
    } catch {
      toast.error('Error inesperado al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCourseLandingDetails(courseId, {
        title,
        description,
        thumbnail_url: thumbnailUrl,
        payment_link: paymentLink,
      });

      if ('error' in result && result.error) {
        const firstFieldError = result.fieldErrors
          ? Object.values(result.fieldErrors)[0]?.[0]
          : undefined;
        toast.error(firstFieldError ?? result.error);
        return;
      }

      toast.success('Programa actualizado en la landing');
      router.refresh();
    });
  };

  return (
    <Accordion type="single" collapsible defaultValue="landing-details" className="mb-6 rounded-lg border">
      <AccordionItem value="landing-details" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
          <div className="flex items-start gap-3 text-left">
            <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 space-y-1">
              <p className="text-base font-semibold leading-none">Portada del programa (landing)</p>
              <p className="text-sm font-normal text-muted-foreground">
                Imagen y texto que se muestran en «Programas destacados» (imagen a un lado, texto al otro).
              </p>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="space-y-5 px-4 pb-4 sm:px-5">
          <div className="space-y-2">
            <Label htmlFor="landing-title">Título</Label>
            <Input
              id="landing-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="landing-description">Texto / descripción</Label>
            <Textarea
              id="landing-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              maxLength={4000}
              className="min-h-[160px]"
            />
            <p className="text-xs text-muted-foreground">{description.length}/4000</p>
          </div>

          <div className="space-y-2">
            <Label>Imagen del programa</Label>
            {thumbnailUrl ? (
              <div className="relative overflow-hidden rounded-lg border">
                <div className="relative aspect-[16/10] w-full bg-muted">
                  <Image src={thumbnailUrl} alt="Portada" fill className="object-cover" unoptimized />
                </div>
                <div className="flex flex-wrap gap-2 border-t p-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    {isUploading ? 'Subiendo…' : 'Cambiar imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading || isPending}
                      onChange={(e) => {
                        void handleUpload(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isUploading || isPending}
                    onClick={() => setThumbnailUrl('')}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Quitar
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-10 text-sm text-muted-foreground hover:bg-muted/40">
                <Upload className="h-6 w-6" />
                {isUploading ? 'Subiendo…' : 'Subir imagen de portada'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading || isPending}
                  onChange={(e) => {
                    void handleUpload(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="landing-payment">Link de pago (opcional)</Label>
            <Input
              id="landing-payment"
              value={paymentLink}
              onChange={(e) => setPaymentLink(e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" disabled={!hasChanges || isPending || isUploading || !thumbnailUrl} onClick={handleSave}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                'Guardar portada'
              )}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
