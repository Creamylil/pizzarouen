'use client';

import DeleteDialog from '@/components/admin/DeleteDialog';
import { deleteRedirect } from '../actions/redirects';

export default function DeleteRedirectButton({ id, source }: { id: string; source: string }) {
  return (
    <DeleteDialog
      title={`Supprimer la redirection "${source}" ?`}
      description="Cette redirection sera définitivement supprimée."
      onConfirm={() => deleteRedirect(id)}
    />
  );
}
