import Link from 'next/link';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/require-role';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil } from 'lucide-react';
import DeleteRedirectButton from './DeleteRedirectButton';

export default async function RedirectsPage() {
  await requirePermission('redirects');

  const supabase = createAdminSupabaseClient();
  const { data: redirects } = await supabase
    .from('city_redirects')
    .select('id, source_path, destination_path, permanent, cities(name)')
    .order('source_path');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Redirections</h1>
        <Button asChild>
          <Link href="/admin/redirects/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(redirects ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-sm">{r.source_path}</TableCell>
                <TableCell className="font-mono text-sm">{r.destination_path}</TableCell>
                <TableCell className="text-gray-500">
                  {(r.cities as unknown as { name: string })?.name ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={r.permanent ? 'default' : 'secondary'}>
                    {r.permanent ? '301' : '302'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/redirects/${r.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteRedirectButton id={r.id} source={r.source_path} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
