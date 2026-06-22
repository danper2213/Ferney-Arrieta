import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatExpiryDate } from '@/lib/enrollment-access';
import { cn } from '@/lib/utils';
import { CalendarX, Home } from 'lucide-react';

type CourseAccessExpiredProps = {
  courseTitle: string;
  expiresAt: string | null;
};

export function CourseAccessExpired({ courseTitle, expiresAt }: CourseAccessExpiredProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-destructive/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <CalendarX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acceso expirado</CardTitle>
          <CardDescription className="text-base">
            Tu acceso al curso <strong>{courseTitle}</strong> ha finalizado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {expiresAt && (
            <p className="text-sm text-muted-foreground">
              El acceso caducó el{' '}
              <span className="font-medium text-foreground">{formatExpiryDate(expiresAt)}</span>.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Si deseas continuar aprendiendo, contacta con el administrador para renovar tu acceso.
          </p>
          <Link href="/dashboard" className={cn(buttonVariants(), 'gap-2')}>
            <Home className="h-4 w-4" />
            Volver a Mis Programas
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
