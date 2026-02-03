'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { register, type RegisterState } from '@/app/register/actions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader
          variant="spinner"
          size="sm"
          label="Creando cuenta..."
          invert
        />
      ) : (
        'Registrarse'
      )}
    </Button>
  );
}

export default function RegisterPage() {
  const initialState: RegisterState = {};

  const [state, formAction] = useActionState<RegisterState, FormData>(
    register as (prevState: RegisterState, formData: FormData) => Promise<RegisterState | void>,
    initialState,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Crear cuenta
          </h1>
          <p className="text-sm text-muted-foreground">
            Completa el formulario para crear tu cuenta en la plataforma.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Nombre para mostrar</Label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                placeholder="Tu nombre"
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Número de celular</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+57 300 123 4567"
                autoComplete="tel"
                required
              />
            </div>

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
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                required
                minLength={6}
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {state.error}
            </p>
          )}

          <SubmitButton />

          <div className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Inicia sesión
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
