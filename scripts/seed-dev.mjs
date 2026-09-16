// Idempotent development seed for the local Supabase stack.
//
// Creates two auth users (a master and a student) and a small demo course with
// drip-gated lessons so the app can be exercised end-to-end locally.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-dev.mjs
//
// When run without env vars it falls back to the local defaults printed by
// `npx supabase status`.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY). Get it from `npx supabase status -o env`.',
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MASTER = { email: 'master@demo.test', password: 'password123', display_name: 'Ferney (Master)', phone: '3000000001', role: 'master' };
const STUDENT = { email: 'student@demo.test', password: 'password123', display_name: 'Demo Student', phone: '3000000002', role: 'student' };

async function ensureUser({ email, password }) {
  // Look for an existing user with this email (createUser errors on dupes).
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) return found;
    if (data.users.length < 200) break;
    page += 1;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

async function upsertProfile(user, { role, display_name, phone }) {
  const { error } = await admin
    .from('profiles')
    .upsert({ id: user.id, role, display_name, phone }, { onConflict: 'id' });
  if (error) throw error;
}

async function main() {
  const master = await ensureUser(MASTER);
  await upsertProfile(master, MASTER);
  const student = await ensureUser(STUDENT);
  await upsertProfile(student, STUDENT);
  console.log(`master: ${master.id}`);
  console.log(`student: ${student.id}`);

  // Demo course (idempotent by slug).
  const slug = 'curso-demo';
  let { data: course } = await admin.from('courses').select('id').eq('slug', slug).maybeSingle();
  if (!course) {
    const { data, error } = await admin
      .from('courses')
      .insert({
        title: 'Curso Demo de Trading',
        slug,
        description: 'Curso de demostración para el entorno de desarrollo local. Incluye lecciones con desbloqueo por goteo (drip).',
        thumbnail_url: 'https://placehold.co/640x360/1e293b/ffffff/png?text=Curso+Demo',
        is_published: true,
        program_content: 'Fundamentos, práctica y estrategia aplicada.',
        default_access_days: 365,
      })
      .select('id')
      .single();
    if (error) throw error;
    course = data;
  }
  console.log(`course: ${course.id}`);

  // Module (idempotent by course_id + title).
  let { data: mod } = await admin
    .from('modules')
    .select('id')
    .eq('course_id', course.id)
    .eq('title', 'Módulo 1: Introducción')
    .maybeSingle();
  if (!mod) {
    const { data, error } = await admin
      .from('modules')
      .insert({ course_id: course.id, title: 'Módulo 1: Introducción', order_index: 0 })
      .select('id')
      .single();
    if (error) throw error;
    mod = data;
  }

  // Lessons: one unlocked (day 0) and one drip-locked (day 30).
  const lessons = [
    { title: 'Lección 1: Bienvenida', description: 'Introducción al curso. Disponible desde el primer día.', days_to_unlock: 0, order_index: 0 },
    { title: 'Lección 2: Estrategia avanzada', description: 'Se desbloquea 30 días después de la inscripción (drip).', days_to_unlock: 30, order_index: 1 },
  ];
  for (const l of lessons) {
    const { data: existing } = await admin
      .from('lessons')
      .select('id')
      .eq('module_id', mod.id)
      .eq('title', l.title)
      .maybeSingle();
    if (!existing) {
      const { error } = await admin.from('lessons').insert({ module_id: mod.id, ...l });
      if (error) throw error;
    }
  }

  // Enrollment for the student (created_at = now → day-0 lesson unlocked).
  const { error: enrollErr } = await admin
    .from('enrollments')
    .upsert({ user_id: student.id, course_id: course.id }, { onConflict: 'user_id,course_id' });
  if (enrollErr) throw enrollErr;

  // App settings.
  const { error: settingsErr } = await admin
    .from('app_settings')
    .upsert(
      { key: 'whatsapp_support_number', value: '573000000000', label: 'Número de WhatsApp de soporte' },
      { onConflict: 'key' },
    );
  if (settingsErr) throw settingsErr;

  console.log('\nSeed complete. Logins (password: password123):');
  console.log('  master@demo.test   → /admin/dashboard');
  console.log('  student@demo.test  → /dashboard (enrolled in "Curso Demo de Trading")');
}

main().catch((e) => {
  console.error('Seed failed:', e.message || e);
  process.exit(1);
});
