import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/auth/require-role';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil } from 'lucide-react';
import DeletePricingButton from './DeletePricingButton';

function createPricingClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export default async function PricingPage() {
  await requirePermission('pricing');

  const supabase = createPricingClient();
  const { data: plans } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('display_order');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Formules tarifaires</h1>
        <Button asChild>
          <Link href="/admin/pricing/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordre</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Mensuel</TableHead>
              <TableHead>Annuel</TableHead>
              <TableHead>Populaire</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {((plans as Record<string, unknown>[] | null) ?? []).map((p) => (
              <TableRow key={p.id as string}>
                <TableCell className="text-gray-500">{p.display_order as number}</TableCell>
                <TableCell className="font-medium">{p.name as string}</TableCell>
                <TableCell className="text-gray-500">{p.slug as string}</TableCell>
                <TableCell>{p.price_monthly as number} &euro;/mois</TableCell>
                <TableCell>{p.price_annual as number} &euro;/an</TableCell>
                <TableCell>
                  {(p.is_popular as boolean) && <Badge>Populaire</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/pricing/${p.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeletePricingButton id={p.id as string} name={p.name as string} />
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
