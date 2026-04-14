import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export interface CommercialRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  can_see_all_deals: boolean;
  commission_month1_rate: number;
  commission_recurring_rate: number;
  commission_duration_months: number;
}

export type SessionInfo =
  | { role: 'admin'; userId: string; commercial: null }
  | { role: 'commercial'; userId: string; commercial: CommercialRow }
  | null;

/**
 * Récupère le rôle de l'utilisateur connecté + infos commercial si applicable.
 * Utilisable dans les server components et server actions (pas middleware).
 */
export async function getSessionRole(): Promise<SessionInfo> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const store = await cookieStore;
            cookiesToSet.forEach(({ name, value, options }) =>
              store.set(name, value, options)
            );
          } catch {
            // Ignore — cookies can't be set in server components
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Query role (admin ou commercial)
  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'commercial'])
    .maybeSingle();

  if (!roleRow) return null;

  const role = roleRow.role as 'admin' | 'commercial';

  if (role === 'admin') {
    return { role: 'admin', userId: user.id, commercial: null };
  }

  // Pour les commerciaux, récupérer les infos depuis la table commercials
  const crmClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: commercial } = await crmClient
    .from('commercials')
    .select('id, name, email, phone, can_see_all_deals, commission_month1_rate, commission_recurring_rate, commission_duration_months')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!commercial) {
    // Commercial role mais pas de fiche commercial liée — bloquer
    return null;
  }

  return {
    role: 'commercial',
    userId: user.id,
    commercial: commercial as unknown as CommercialRow,
  };
}
