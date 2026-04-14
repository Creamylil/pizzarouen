import Link from 'next/link';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/require-role';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Star } from 'lucide-react';
import DeletePizzeriaButton from './DeletePizzeriaButton';

export default async function PizzeriasPage() {
  await requireAdmin();

  const supabase = createAdminSupabaseClient();
  const { data: pizzerias } = await supabase
    .from('pizzerias')
    .select('id, name, address, city_id, rating, halal, priority_level, phone, cities(name)')
    .order('name');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pizzerias</h1>
        <Button asChild>
          <Link href="/admin/pizzerias/new">
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
              <TableHead>Ville</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(pizzerias ?? []).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {p.name}
                  {p.halal && <Badge variant="outline" className="ml-2 text-xs">Halal</Badge>}
                </TableCell>
                <TableCell className="text-gray-500">
                  {(p.cities as unknown as { name: string })?.name ?? '—'}
                </TableCell>
                <TableCell className="text-gray-500 max-w-48 truncate">{p.address}</TableCell>
                <TableCell>
                  {p.rating ? (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {p.rating}
                    </span>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  {p.priority_level ? (
                    <Badge variant="secondary">{p.priority_level}</Badge>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild title="Modifier">
                      <Link href={`/admin/pizzerias/${p.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeletePizzeriaButton id={p.id} name={p.name} />
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
