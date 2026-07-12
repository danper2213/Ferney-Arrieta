'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle } from 'lucide-react';
import { login, type LoginState } from '@/app/login/actions';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader } from '@/components/ui/loader';
import { cn } from '@/lib/utils';

const REMEMBER_EMAIL_KEY = 'ferney-login-remember-email';
const REMEMBER_EMAIL_ENABLED_KEY = 'ferney-login-remember-enabled';

const fieldClass =
  'h-11 border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus-visible:border-blue-500/60 focus-visible:ring-blue-500/30';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="h-11 w-full bg-blue-600 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.35)] hover:bg-blue-500"
      disabled={pending}
    >
      {pending ? (
        <Loader variant="spinner" size="sm" label="Iniciando sesión..." invert />
      ) : (
        'Iniciar sesión'
      )}
    </Button>
  );
}

export default function LoginPage() {
  const initialState: LoginState = {};
  const [state, formAction] = useActionState<LoginState, FormData>(
    login as (prevState: LoginState, formData: FormData) => Promise<LoginState>,
    initialState
  );

  const [email, setEmail] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    const rememberEnabled = localStorage.getItem(REMEMBER_EMAIL_ENABLED_KEY) === 'true';

    if (rememberEnabled && savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  function handleSubmit() {
    if (rememberEmail) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      localStorage.setItem(REMEMBER_EMAIL_ENABLED_KEY, 'true');
      return;
    }

    localStorage.removeItem(REMEMBER_EMAIL_KEY);
    localStorage.setItem(REMEMBER_EMAIL_ENABLED_KEY, 'false');
  }

  return (
    <AuthShell
      title="Bienvenido de nuevo"
      description="Ingresa con tu correo y contraseña para continuar en tu programa."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link
            href="/register"
            className="font-semibold text-blue-400 underline-offset-4 transition-colors hover:text-blue-300 hover:underline"
          >
            Crear cuenta
          </Link>
        </>
      }
    >
      <form
        action={formAction}
        autoComplete="on"
        className="space-y-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              placeholder="tu@correo.com"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={fieldClass}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className="text-slate-200">
                Contraseña
              </Label>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
              className={cn(fieldClass, 'pr-10')}
            />
          </div>

          <div className="flex items-center gap-2.5 pt-0.5">
            <Checkbox
              id="remember-email"
              checked={rememberEmail}
              onCheckedChange={(checked) => setRememberEmail(checked === true)}
              className="border-white/20 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
            />
            <Label
              htmlFor="remember-email"
              className="cursor-pointer text-sm font-normal leading-none text-slate-300"
            >
              Recordar mi correo en este dispositivo
            </Label>
          </div>
        </div>

        {state?.error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{state.error}</p>
          </div>
        )}

        <SubmitButton />
      </form>
    </AuthShell>
  );
}
