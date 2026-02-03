'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { publishCourse } from './actions';
import { useRouter } from 'next/navigation';

export function PublishButton({
  courseId,
  isPublished,
}: {
  courseId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handlePublish = () => {
    setError(null);
    startTransition(async () => {
      const result = await publishCourse(courseId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  if (isPublished) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Curso Publicado
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={handlePublish} disabled={isPending} size="lg" className="gap-2">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Publicando...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Publicar Curso
          </>
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
