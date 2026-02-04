'use client';

import { useRef, useState, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { updateProfile, updatePasswordForm } from '@/app/actions/student/profile';
import { toast } from 'sonner';

type ProfileFormProps = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
};

function ProfileSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-primary hover:bg-primary/90">
      {pending ? 'Guardando...' : 'Guardar Cambios'}
    </Button>
  );
}

function PasswordSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? 'Actualizando...' : 'Actualizar Contraseña'}
    </Button>
  );
}

export function ProfileForm({
  displayName,
  email,
  avatarUrl,
}: ProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleProfileSubmit = async (formData: FormData) => {
    const result = await updateProfile(formData);
    if ((result as any).error) {
      toast.error((result as any).error);
      return;
    }
    toast.success('Perfil actualizado');
    setAvatarPreview(null);
  };

  const handlePasswordSubmit = async (formData: FormData) => {
    const result = await updatePasswordForm(formData);
    if ((result as any).error) {
      toast.error((result as any).error);
      return;
    }
    toast.success('Contraseña cambiada');
  };

  const displayAvatarUrl = avatarPreview ?? avatarUrl;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Columna Izquierda - Datos Públicos */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Datos públicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={handleProfileSubmit} className="space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              name="avatarFile"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="group relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Avatar className="h-32 w-32 border-4 border-slate-700 ring-2 ring-slate-800">
                  {displayAvatarUrl ? (
                    <AvatarImage
                      src={displayAvatarUrl}
                      alt="Avatar"
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-slate-700 text-2xl text-slate-300">
                    {(displayName || email || 'U').slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-8 w-8 text-white" />
                </span>
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-slate-200">
                Nombre completo
              </Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={displayName}
                placeholder="Tu nombre"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                readOnly
                disabled
                className="border-slate-700 bg-slate-800/50 text-slate-400 cursor-not-allowed"
              />
            </div>

            <ProfileSubmitButton />
          </form>
        </CardContent>
      </Card>

      {/* Columna Derecha - Seguridad */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-200">
                Nueva contraseña
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">
                Confirmar contraseña
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <PasswordSubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
