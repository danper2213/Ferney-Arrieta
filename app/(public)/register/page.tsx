'use client';

import Link from 'next/link';
import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Check } from 'lucide-react';
import { register, type RegisterState } from '@/app/register/actions';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-11 border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus-visible:border-blue-500/60 focus-visible:ring-blue-500/30';

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="h-11 w-full bg-blue-600 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.35)] hover:bg-blue-500"
      disabled={pending || disabled}
    >
      {pending ? (
        <Loader variant="spinner" size="sm" label="Creando cuenta..." invert />
      ) : (
        'Crear cuenta'
      )}
    </Button>
  );
}

function PasswordHints({ password }: { password: string }) {
  const rules = useMemo(
    () => [
      { ok: password.length >= 6, label: 'Mínimo 6 caracteres' },
      { ok: /[A-Za-z]/.test(password), label: 'Incluye una letra' },
      { ok: /[0-9]/.test(password) || password.length >= 8, label: 'Número o 8+ caracteres' },
    ],
    [password]
  );

  if (!password) return null;

  return (
    <ul className="space-y-1.5 pt-1">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={cn(
            'flex items-center gap-2 text-xs',
            rule.ok ? 'text-emerald-400' : 'text-slate-500'
          )}
        >
          <Check className={cn('h-3.5 w-3.5', rule.ok ? 'opacity-100' : 'opacity-40')} />
          {rule.label}
        </li>
      ))}
    </ul>
  );
}

export default function RegisterPage() {
  const initialState: RegisterState = {};
  const [state, formAction] = useActionState<RegisterState, FormData>(
    register as (prevState: RegisterState, formData: FormData) => Promise<RegisterState>,
    initialState
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;
  const canSubmit = password.length >= 6 && passwordsMatch;

  return (
    <AuthShell
      title="Crea tu cuenta"
      description="Regístrate para acceder a tu programa, mentorías y comunidad."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-semibold text-blue-400 underline-offset-4 transition-colors hover:text-blue-300 hover:underline"
          >
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form action={formAction} autoComplete="on" className="space-y-5" noValidate>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-slate-200">
              Nombre para mostrar
            </Label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              placeholder="Tu nombre"
              autoComplete="name"
              required
              className={fieldClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-200">
              Número de celular
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+57 300 123 4567"
              autoComplete="tel"
              required
              className={fieldClass}
            />
          </div>

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
              autoComplete="email"
              required
              className={fieldClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Contraseña
            </Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="Crea una contraseña segura"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(fieldClass, 'pr-10')}
            />
            <PasswordHints password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">
              Confirmar contraseña
            </Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                fieldClass,
                'pr-10',
                confirmPassword && !passwordsMatch && 'border-red-500/50 focus-visible:ring-red-500/30'
              )}
              aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-300">Las contraseñas no coinciden.</p>
            )}
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

        <SubmitButton disabled={!canSubmit} />

        <p className="text-center text-[11px] leading-relaxed text-slate-500">
          Al crear tu cuenta aceptas el uso de tu información para gestionar tu acceso a la
          plataforma.
        </p>
      </form>
    </AuthShell>
  );
}
