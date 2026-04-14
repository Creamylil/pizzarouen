import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/auth/require-role';
import PricingForm from '../PricingForm';

function createPricingClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export default async function EditPricingPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('pricing');

  const { id } = await params;
  const supabase = createPricingClient();

  const { data: plan } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (!plan) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modifier : {(plan as Record<string, unknown>).name as string}</h1>
      <PricingForm plan={plan as Record<string, unknown>} />
    </div>
  );
}
