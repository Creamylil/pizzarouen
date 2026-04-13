import { notFound } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import SectorForm from '../SectorForm';

export default async function EditSectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const [{ data: sector }, { data: cities }] = await Promise.all([
    supabase.from('geographic_sectors').select('*').eq('id', id).single(),
    supabase.from('cities').select('id, name').order('name'),
  ]);

  if (!sector) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modifier : {sector.display_name || sector.name}</h1>
      <SectorForm sector={sector} cities={cities ?? []} />
    </div>
  );
}
