'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeLesson } from '@/app/(student)/course/[courseSlug]/lesson/[lessonId]/actions';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

type MarkAsViewedButtonProps = {
  lessonId: string;
  courseSlug: string;
  nextLessonId: string | null;
};

export function MarkAsViewedButton({ lessonId, courseSlug, nextLessonId }: MarkAsViewedButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    const result = await completeLesson(lessonId, courseSlug, nextLessonId);

    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
      return;
    }

    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleClick}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Marcar como Vista y Continuar
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
