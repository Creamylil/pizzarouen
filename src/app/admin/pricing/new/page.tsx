import PricingForm from '../PricingForm';
import { requirePermission } from '@/lib/auth/require-role';

export default async function NewPricingPage() {
  await requirePermission('pricing');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nouvelle formule</h1>
      <PricingForm />
    </div>
  );
}
