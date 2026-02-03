'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login, type LoginState } from '@/app/login/actions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader
          variant="spinner"
          size="sm"
          label="Iniciando sesión..."
          invert
        />
      ) : (
        'Entrar'
      )}
    </Button>
  );
}

export default function LoginPage() {
  const initialState: LoginState = {};

  const [state, formAction] = useActionState<LoginState, FormData>(
    login as (prevState: LoginState, formData: FormData) => Promise<LoginState | void>,
    initialState,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Iniciar sesión
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa con tu email y contraseña para acceder a la plataforma.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {state.error}
            </p>
          )}

          <SubmitButton />

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

