import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import PizzeriaForm from '../PizzeriaForm';

export default async function NewPizzeriaPage() {
  const supabase = createAdminSupabaseClient();
  const { data: cities } = await supabase.from('cities').select('id, name').order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nouvelle pizzeria</h1>
      <PizzeriaForm cities={cities ?? []} />
    </div>
  );
}
