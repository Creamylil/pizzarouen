'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        async setAll(cookiesToSet) {
          const store = await cookieStore;
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function loginAction(email: string, password: string): Promise<{ error?: string }> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Check admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'commercial'])
      .maybeSingle();

    if (!role) {
      await supabase.auth.signOut();
      return { error: 'Accès refusé. Vous n\'avez pas les droits d\'accès.' };
    }

    if (role.role === 'commercial') {
      redirect('/admin/crm');
    }
  }

  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
