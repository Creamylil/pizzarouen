import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import SectorForm from '../SectorForm';

export default async function NewSectorPage() {
  const supabase = createAdminSupabaseClient();
  const { data: cities } = await supabase.from('cities').select('id, name').order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nouveau secteur</h1>
      <SectorForm cities={cities ?? []} />
    </div>
  );
}
