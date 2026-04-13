'use client';

import DeleteDialog from '@/components/admin/DeleteDialog';
import { deleteCity } from '../actions/cities';

export default function DeleteCityButton({ id, name }: { id: string; name: string }) {
  return (
    <DeleteDialog
      title={`Supprimer "${name}" ?`}
      description="Toutes les pizzerias, secteurs et redirects associés seront également supprimés."
      onConfirm={() => deleteCity(id)}
    />
  );
}
