'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { generatePaymentLink } from '../../actions/crm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Link2, Copy, Loader2 } from 'lucide-react';

interface GeneratePaymentButtonProps {
  dealId: string;
  pizzeriaId: string;
  monthlyAmount: number;
  isAnnual: boolean;
  pricingPlan: string;
  lastPaymentLink: string | null;
}

export default function GeneratePaymentButton({
  dealId,
  pizzeriaId,
  monthlyAmount,
  isAnnual,
  pricingPlan,
  lastPaymentLink,
}: GeneratePaymentButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<'one_time' | 'recurring' | null>(null);

  const oneTimeAmount = isAnnual
    ? (monthlyAmount * 12).toFixed(2)
    : monthlyAmount.toFixed(2);
  const recurringAmount = monthlyAmount.toFixed(2);

  async function handleGenerate(paymentType: 'one_time' | 'recurring') {
    setLoading(paymentType);
    const result = await generatePaymentLink(dealId, pizzeriaId, paymentType);
    setLoading(null);

    if (result.success) {
      try {
        await navigator.clipboard.writeText(result.url);
        toast.success('Lien copié dans le presse-papiers !', {
          description: result.url.length > 60
            ? result.url.substring(0, 60) + '...'
            : result.url,
          duration: 5000,
        });
      } catch {
        // Clipboard API might fail in some contexts — show URL in toast
        toast.success('Lien généré !', {
          description: result.url,
          duration: 8000,
        });
      }
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleCopyLast() {
    if (!lastPaymentLink) return;
    try {
      await navigator.clipboard.writeText(lastPaymentLink);
      toast.success('Dernier lien copié !');
    } catch {
      toast.info(lastPaymentLink);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Link2 className="h-4 w-4 mr-1" />
            Lien de paiement
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Générer un lien de paiement</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 mb-4">
            Choisissez le type de paiement pour cette formule{' '}
            <span className="font-medium text-gray-700">{pricingPlan}</span>.
          </p>
          <div className="space-y-3">
            {/* One-time payment */}
            <button
              type="button"
              onClick={() => handleGenerate('one_time')}
              disabled={loading !== null}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left disabled:opacity-50"
            >
              <div>
                <p className="font-medium text-gray-900">Paiement unique</p>
                <p className="text-sm text-gray-500">
                  Le client paie en une fois
                  {isAnnual && ' (montant annuel)'}
                </p>
              </div>
              <div className="text-right">
                {loading === 'one_time' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <span className="text-lg font-bold text-blue-600">{oneTimeAmount}€</span>
                )}
              </div>
            </button>

            {/* Recurring subscription */}
            <button
              type="button"
              onClick={() => handleGenerate('recurring')}
              disabled={loading !== null}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all text-left disabled:opacity-50"
            >
              <div>
                <p className="font-medium text-gray-900">Abonnement mensuel</p>
                <p className="text-sm text-gray-500">
                  Prélèvement automatique chaque mois
                </p>
              </div>
              <div className="text-right">
                {loading === 'recurring' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                ) : (
                  <span className="text-lg font-bold text-green-600">{recurringAmount}€/mois</span>
                )}
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {lastPaymentLink && (
        <Button variant="ghost" size="sm" onClick={handleCopyLast} title="Copier le dernier lien">
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
