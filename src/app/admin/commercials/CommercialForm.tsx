'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { upsertCommercial } from '../actions/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil } from 'lucide-react';

interface CommercialFormProps {
  existing?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    user_id: string | null;
    can_see_all_deals: boolean;
    commission_month1_rate: number | null;
    commission_recurring_rate: number | null;
    commission_duration_months: number | null;
  };
}

export default function CommercialForm({ existing }: CommercialFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existing?.name ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [userId, setUserId] = useState(existing?.user_id ?? '');
  const [canSeeAllDeals, setCanSeeAllDeals] = useState(existing?.can_see_all_deals ?? false);
  const [commissionMonth1Rate, setCommissionMonth1Rate] = useState<number | null>(existing?.commission_month1_rate ?? null);
  const [commissionRecurringRate, setCommissionRecurringRate] = useState<number | null>(existing?.commission_recurring_rate ?? null);
  const [commissionDurationMonths, setCommissionDurationMonths] = useState<number | null>(existing?.commission_duration_months ?? null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!existing;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    setLoading(true);
    const result = await upsertCommercial(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        user_id: userId.trim(),
        can_see_all_deals: canSeeAllDeals,
        commission_month1_rate: commissionMonth1Rate,
        commission_recurring_rate: commissionRecurringRate,
        commission_duration_months: commissionDurationMonths,
      },
      existing?.id
    );
    setLoading(false);
    if (result.success) {
      toast.success(isEdit ? 'Commercial mis à jour' : 'Commercial ajouté');
      setOpen(false);
      if (!isEdit) {
        setName('');
        setEmail('');
        setPhone('');
        setUserId('');
        setCanSeeAllDeals(false);
        setCommissionMonth1Rate(null);
        setCommissionRecurringRate(null);
        setCommissionDurationMonths(null);
      }
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter un commercial
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le commercial' : 'Nouveau commercial'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nom *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Téléphone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          {/* Section Compte utilisateur */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700">Compte utilisateur</h3>
            <div>
              <label className="text-sm font-medium mb-1 block">User ID (Supabase)</label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="UUID de l'utilisateur..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="can_see_all_deals"
                checked={canSeeAllDeals}
                onCheckedChange={(checked) => setCanSeeAllDeals(checked === true)}
              />
              <label htmlFor="can_see_all_deals" className="text-sm font-medium cursor-pointer">
                Peut voir tous les deals
              </label>
            </div>
          </div>

          {/* Section Commission */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700">Commission</h3>
            <div>
              <label className="text-sm font-medium mb-1 block">Taux mois 1 (%)</label>
              <Input
                type="number"
                step={0.1}
                value={commissionMonth1Rate ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setCommissionMonth1Rate(val === '' ? null : parseFloat(val));
                }}
                placeholder="50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Taux récurrent (%)</label>
              <Input
                type="number"
                step={0.1}
                value={commissionRecurringRate ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setCommissionRecurringRate(val === '' ? null : parseFloat(val));
                }}
                placeholder="20"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Durée (mois)</label>
              <Input
                type="number"
                value={commissionDurationMonths ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setCommissionDurationMonths(val === '' ? null : parseInt(val, 10));
                }}
                placeholder="6"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
