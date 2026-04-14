import { notFound } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/require-role';
import RedirectForm from '../RedirectForm';

export default async function EditRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('redirects');

  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const [{ data: redirect }, { data: cities }] = await Promise.all([
    supabase.from('city_redirects').select('*').eq('id', id).single(),
    supabase.from('cities').select('id, name').order('name'),
  ]);

  if (!redirect) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modifier la redirection</h1>
      <RedirectForm redirect={redirect} cities={cities ?? []} />
    </div>
  );
}
