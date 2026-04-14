import PricingForm from '../PricingForm';
import { requireAdmin } from '@/lib/auth/require-role';

export default async function NewPricingPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nouvelle formule</h1>
      <PricingForm />
    </div>
  );
}
