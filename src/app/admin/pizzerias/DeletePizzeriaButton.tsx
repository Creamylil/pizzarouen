'use client';

import DeleteDialog from '@/components/admin/DeleteDialog';
import { deletePizzeria } from '../actions/pizzerias';

export default function DeletePizzeriaButton({ id, name }: { id: string; name: string }) {
  return (
    <DeleteDialog
      title={`Supprimer "${name}" ?`}
      description="Cette pizzeria sera définitivement supprimée."
      onConfirm={() => deletePizzeria(id)}
    />
  );
}
