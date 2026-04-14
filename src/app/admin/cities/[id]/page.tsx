import { notFound } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/require-role';
import CityForm from '../CityForm';

export default async function EditCityPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('cities');

  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: city } = await supabase
    .from('cities')
    .select('*')
    .eq('id', id)
    .single();

  if (!city) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modifier : {city.display_name}</h1>
      <CityForm city={city} />
    </div>
  );
}
