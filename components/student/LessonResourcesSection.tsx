import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatResourceSize,
  getResourceTypeLabel,
  type LessonResource,
} from '@/lib/lesson-resources';
import { cn } from '@/lib/utils';
import { Download, FileAudio, FileImage, FileText, Paperclip } from 'lucide-react';

export type LessonResourceWithUrl = LessonResource & {
  url: string | null;
};

type LessonResourcesSectionProps = {
  resources: LessonResourceWithUrl[];
};

function ResourceIcon({ type }: { type: LessonResource['resource_type'] }) {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'audio':
      return <FileAudio className="h-5 w-5 text-blue-500" />;
    case 'image':
      return <FileImage className="h-5 w-5 text-emerald-500" />;
  }
}

export function LessonResourcesSection({ resources }: LessonResourcesSectionProps) {
  if (resources.length === 0) {
    return null;
  }

  const pdfs = resources.filter((r) => r.resource_type === 'pdf');
  const audios = resources.filter((r) => r.resource_type === 'audio');
  const images = resources.filter((r) => r.resource_type === 'image');

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-xl">Recursos de apoyo</CardTitle>
        </div>
        <CardDescription>
          Material complementario para reforzar lo aprendido en esta lección
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {pdfs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Documentos PDF
            </h3>
            <ul className="space-y-2">
              {pdfs.map((resource) => (
                <li
                  key={resource.id}
                  className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ResourceIcon type={resource.resource_type} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatResourceSize(resource.file_size)}
                      </p>
                    </div>
                  </div>
                  {resource.url ? (
                    <Link
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0 gap-2')}
                    >
                      <Download className="h-4 w-4" />
                      Descargar
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">No disponible</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {audios.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Audios
            </h3>
            <ul className="space-y-4">
              {audios.map((resource) => (
                <li key={resource.id} className="rounded-lg border px-4 py-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <ResourceIcon type={resource.resource_type} />
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getResourceTypeLabel(resource.resource_type)} ·{' '}
                        {formatResourceSize(resource.file_size)}
                      </p>
                    </div>
                  </div>
                  {resource.url ? (
                    <audio controls preload="metadata" className="w-full">
                      <source src={resource.url} type={resource.mime_type} />
                      Tu navegador no soporta la reproducción de audio.
                    </audio>
                  ) : (
                    <p className="text-xs text-muted-foreground">Audio no disponible</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {images.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Imágenes
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {images.map((resource) => (
                <figure key={resource.id} className="overflow-hidden rounded-lg border">
                  {resource.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resource.url}
                      alt={resource.title}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-muted text-sm text-muted-foreground">
                      Imagen no disponible
                    </div>
                  )}
                  <figcaption className="border-t px-3 py-2 text-sm font-medium">
                    {resource.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
