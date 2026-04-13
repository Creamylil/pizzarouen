import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import RedirectForm from '../RedirectForm';

export default async function NewRedirectPage() {
  const supabase = createAdminSupabaseClient();
  const { data: cities } = await supabase.from('cities').select('id, name').order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nouvelle redirection</h1>
      <RedirectForm cities={cities ?? []} />
    </div>
  );
}
