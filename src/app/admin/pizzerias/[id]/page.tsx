import { notFound } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import PizzeriaForm from '../PizzeriaForm';

export default async function EditPizzeriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const [{ data: pizzeria }, { data: cities }] = await Promise.all([
    supabase.from('pizzerias').select('*').eq('id', id).single(),
    supabase.from('cities').select('id, name').order('name'),
  ]);

  if (!pizzeria) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modifier : {pizzeria.name}</h1>
      <PizzeriaForm pizzeria={pizzeria} cities={cities ?? []} />
    </div>
  );
}
