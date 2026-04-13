'use client';

import DeleteDialog from '@/components/admin/DeleteDialog';
import { deletePricing } from '../actions/pricing';

export default function DeletePricingButton({ id, name }: { id: string; name: string }) {
  return (
    <DeleteDialog
      title={`Supprimer "${name}" ?`}
      description="Cette formule sera définitivement supprimée."
      onConfirm={() => deletePricing(id)}
    />
  );
}
