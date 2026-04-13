'use client';

import DeleteDialog from '@/components/admin/DeleteDialog';
import { deleteSector } from '../actions/sectors';

export default function DeleteSectorButton({ id, name }: { id: string; name: string }) {
  return (
    <DeleteDialog
      title={`Supprimer "${name}" ?`}
      description="Ce secteur sera définitivement supprimé."
      onConfirm={() => deleteSector(id)}
    />
  );
}
