import CityForm from '../CityForm';
import { requirePermission } from '@/lib/auth/require-role';

export default async function NewCityPage() {
  await requirePermission('cities');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nouvelle ville</h1>
      <CityForm />
    </div>
  );
}
