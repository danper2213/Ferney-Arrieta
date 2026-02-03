'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const courseSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'El slug solo puede contener letras minúsculas, números y guiones'
    ),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  thumbnail_url: z.string().url('Debe ser una URL válida'),
});

export type CreateCourseState = {
  error?: string;
  fieldErrors?: {
    title?: string[];
    slug?: string[];
    description?: string[];
    thumbnail_url?: string[];
  };
};

export async function createCourse(
  _prevState: CreateCourseState,
  formData: FormData
): Promise<CreateCourseState | void> {
  // Validar los datos del formulario
  const validatedFields = courseSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    thumbnail_url: formData.get('thumbnail_url'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Por favor, corrige los errores en el formulario',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, slug, description, thumbnail_url } = validatedFields.data;

  try {
    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: 'Debes iniciar sesión para crear un curso',
      };
    }

    // Verificar que el slug no exista
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingCourse) {
      return {
        error: 'Ya existe un curso con ese slug',
        fieldErrors: {
          slug: ['Este slug ya está en uso'],
        },
      };
    }

    // Insertar el curso
    const { error: insertError } = await supabase.from('courses').insert({
      title,
      slug,
      description,
      thumbnail_url,
    });

    if (insertError) {
      console.error('Error al crear el curso:', insertError);
      return {
        error: 'Error al crear el curso. Por favor, intenta de nuevo.',
      };
    }

    revalidatePath('/');
    revalidatePath('/admin/courses');
    // Redirigir a la lista de cursos
    redirect('/admin/courses');
  } catch (error) {
    console.error('Error inesperado:', error);
    return {
      error: 'Error inesperado. Por favor, intenta de nuevo.',
    };
  }
}
