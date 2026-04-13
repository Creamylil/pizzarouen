import Link from 'next/link';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil } from 'lucide-react';
import DeleteSectorButton from './DeleteSectorButton';

export default async function SectorsPage() {
  const supabase = createAdminSupabaseClient();
  const { data: sectors } = await supabase
    .from('geographic_sectors')
    .select('id, name, slug, display_name, display_order, postal_code, cities(name)')
    .order('display_order');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Secteurs</h1>
        <Button asChild>
          <Link href="/admin/sectors/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordre</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Code postal</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(sectors ?? []).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-gray-500">{s.display_order}</TableCell>
                <TableCell className="font-medium">{s.display_name || s.name}</TableCell>
                <TableCell className="text-gray-500">{s.slug}</TableCell>
                <TableCell className="text-gray-500">
                  {(s.cities as unknown as { name: string })?.name ?? '—'}
                </TableCell>
                <TableCell>{s.postal_code || '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/sectors/${s.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteSectorButton id={s.id} name={s.display_name || s.name} />
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
