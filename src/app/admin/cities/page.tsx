import Link from 'next/link';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/require-role';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil } from 'lucide-react';
import DeleteCityButton from './DeleteCityButton';

export default async function CitiesPage() {
  await requirePermission('cities');

  const supabase = createAdminSupabaseClient();
  const { data: cities } = await supabase
    .from('cities')
    .select('id, slug, name, display_name, domain, contact_email')
    .order('name');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Villes</h1>
        <Button asChild>
          <Link href="/admin/cities/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Domaine</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(cities ?? []).map((city) => (
              <TableRow key={city.id}>
                <TableCell className="font-medium">{city.display_name}</TableCell>
                <TableCell className="text-gray-500">{city.slug}</TableCell>
                <TableCell>{city.domain}</TableCell>
                <TableCell className="text-gray-500">{city.contact_email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/cities/${city.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteCityButton id={city.id} name={city.display_name} />
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
