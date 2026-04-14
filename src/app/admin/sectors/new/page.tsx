import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/require-role';
import SectorForm from '../SectorForm';

export default async function NewSectorPage() {
  await requirePermission('sectors');

  const supabase = createAdminSupabaseClient();
  const { data: cities } = await supabase.from('cities').select('id, name').order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nouveau secteur</h1>
      <SectorForm cities={cities ?? []} />
    </div>
  );
}
