'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { postComment, type PostCommentState } from '@/app/(student)/course/[courseSlug]/lesson/[lessonId]/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

type RealtimeInsertPayload = {
  new: {
    id: string;
    content: string;
    user_id: string;
    lesson_id: string;
    created_at: string;
  };
};

type CommentWithProfile = {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string | null;
  } | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} size="sm" className="gap-2">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          <Send className="h-4 w-4" />
          Comentar
        </>
      )}
    </Button>
  );
}

type CommentsSectionProps = {
  lessonId: string;
  courseSlug: string;
  comments: CommentWithProfile[];
};

export function CommentsSection({ lessonId, courseSlug, comments: initialComments }: CommentsSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = postComment.bind(null, lessonId, courseSlug);
  const [state, formAction] = useActionState<PostCommentState, FormData>(action, {});
  const [comments, setComments] = useState<CommentWithProfile[]>(initialComments);

  // Sincronizar con los comentarios iniciales solo al cambiar de lección
  useEffect(() => {
    setComments(initialComments);
  }, [lessonId]); // initialComments se usa al montar o al cambiar lessonId

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  // Supabase Realtime: suscripción a INSERT en comments para este lesson_id
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`comments:lesson:${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `lesson_id=eq.${lessonId}`,
        },
        async (payload: RealtimeInsertPayload) => {
          const row = payload.new;
          let displayName: string | null = null;
          try {
            const { data } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', row.user_id)
              .maybeSingle();
            displayName = data?.display_name ?? null;
          } catch {
            // mantener "Usuario" si falla
          }
          const newComment: CommentWithProfile = {
            id: row.id,
            content: row.content,
            created_at: row.created_at,
            profiles: displayName !== null ? { display_name: displayName } : null,
          };
          setComments((prev) => [...prev, newComment]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Comentarios
          {comments.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form ref={formRef} action={formAction} className="space-y-3">
          <Textarea
            name="content"
            placeholder="Escribe un comentario o pregunta..."
            className="min-h-[100px] resize-none border-2"
            maxLength={2000}
            required
          />
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>

        <div className="space-y-4 min-h-[60px]">
          {comments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">
              Aún no hay comentarios. ¡Sé el primero en participar!
            </p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="flex gap-4">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {(comment.profiles?.display_name ?? 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="text-sm font-medium">
                      {comment.profiles?.display_name ?? 'Usuario'}
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
