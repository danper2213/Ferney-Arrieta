'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils/slug';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Upload, X } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(3, {
    message: 'El título debe tener al menos 3 caracteres',
  }),
  slug: z
    .string()
    .min(3, {
      message: 'El slug debe tener al menos 3 caracteres',
    })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'El slug solo puede contener letras minúsculas, números y guiones',
    }),
  description: z.string().min(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  }),
  thumbnail_url: z.string().url({
    message: 'Debe ser una URL válida',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      thumbnail_url: '',
    },
  });

  // Generar slug automáticamente cuando cambia el título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);

    // Solo generar slug automáticamente si el campo slug está vacío o no ha sido editado manualmente
    if (!form.formState.dirtyFields.slug || form.getValues('slug') === '') {
      const slug = generateSlug(title);
      form.setValue('slug', slug);
    }
  };

  // Manejar la subida de imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Subir archivo al bucket 'thumbnails'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error al subir imagen:', uploadError);
        setError('Error al subir la imagen. Por favor, intenta de nuevo.');
        return;
      }

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('thumbnails').getPublicUrl(uploadData.path);

      // Actualizar el formulario con la URL
      form.setValue('thumbnail_url', publicUrl, { shouldValidate: true });
      setThumbnailPreview(publicUrl);
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar imagen
  const handleRemoveImage = () => {
    form.setValue('thumbnail_url', '');
    setThumbnailPreview(null);
  };

  // Enviar formulario
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Verificar que el usuario esté autenticado
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('Debes iniciar sesión para crear un curso');
        setIsSubmitting(false);
        return;
      }

      // Verificar que el slug no exista
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', values.slug)
        .maybeSingle();

      if (existingCourse) {
        form.setError('slug', {
          type: 'manual',
          message: 'Ya existe un curso con ese slug',
        });
        setIsSubmitting(false);
        return;
      }

      // Insertar el curso
      const { error: insertError } = await supabase.from('courses').insert({
        title: values.title,
        slug: values.slug,
        description: values.description,
        thumbnail_url: values.thumbnail_url,
      });

      if (insertError) {
        console.error('Error al crear el curso:', insertError);
        const err = insertError as { message?: string; details?: string; hint?: string; code?: string };
        const message =
          err?.message ||
          err?.details ||
          err?.hint ||
          (typeof err === 'object' && Object.keys(err).length > 0
            ? JSON.stringify(err)
            : 'Error al crear el curso. Por favor, intenta de nuevo.');
        setError(message);
        setIsSubmitting(false);
        return;
      }

      // Redirigir a la lista de cursos
      router.push('/admin/courses');
      router.refresh();
    } catch (err) {
      console.error('Error inesperado:', err);
      const message =
        err instanceof Error ? err.message : 'Error inesperado. Por favor, intenta de nuevo.';
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Crear Nuevo Curso</CardTitle>
          <CardDescription>
            Completa el formulario para crear un nuevo curso en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Curso</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Introducción a React"
                        {...field}
                        onChange={handleTitleChange}
                      />
                    </FormControl>
                    <FormDescription>
                      El nombre principal del curso que verán los estudiantes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="introduccion-a-react" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL amigable del curso. Se genera automáticamente desde el título, pero
                      puedes editarlo manualmente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descripción */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el contenido y objetivos del curso..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Una descripción detallada del curso y lo que aprenderán los estudiantes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thumbnail */}
              <FormField
                control={form.control}
                name="thumbnail_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen del Curso</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {thumbnailPreview ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                            <img
                              src={thumbnailPreview}
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={handleRemoveImage}
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <Label
                              htmlFor="thumbnail"
                              className="cursor-pointer text-sm font-medium text-primary hover:underline"
                            >
                              {isUploading ? 'Subiendo...' : 'Haz clic para subir una imagen'}
                            </Label>
                            <Input
                              id="thumbnail"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              PNG, JPG, GIF hasta 5MB
                            </p>
                          </div>
                        )}
                        <input type="hidden" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Imagen que se mostrará como portada del curso
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error general */}
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando curso...
                    </>
                  ) : (
                    'Crear Curso'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/courses')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
