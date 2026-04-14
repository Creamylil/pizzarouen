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
import { Link2, Copy, Loader2, ExternalLink } from 'lucide-react';

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
        toast.success('Lien copié !', {
          description: result.url.length > 60
            ? result.url.substring(0, 60) + '...'
            : result.url,
          duration: 5000,
        });
      } catch {
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

  async function handleCopyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Lien copié !');
    } catch {
      toast.info(link);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Dernier lien — compact inline */}
      {lastPaymentLink && (
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-md px-2 py-1.5">
          <code className="text-[11px] text-green-700 max-w-[180px] truncate">{lastPaymentLink}</code>
          <button
            type="button"
            onClick={() => handleCopyLink(lastPaymentLink)}
            className="text-green-600 hover:text-green-800 transition-colors"
            title="Copier"
          >
            <Copy className="h-3 w-3" />
          </button>
          <a
            href={lastPaymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 transition-colors"
            title="Ouvrir"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Bouton générer — compact */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            {lastPaymentLink ? 'Nouveau lien' : 'Lien paiement'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Lien de paiement</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 mb-3">
            Formule <span className="font-medium text-gray-700 capitalize">{pricingPlan}</span>
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleGenerate('one_time')}
              disabled={loading !== null}
              className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium">Paiement unique</p>
                <p className="text-xs text-gray-500">
                  En une fois{isAnnual && ' (annuel)'}
                </p>
              </div>
              {loading === 'one_time' ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : (
                <span className="text-sm font-bold text-blue-600">{oneTimeAmount}€</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleGenerate('recurring')}
              disabled={loading !== null}
              className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-green-300 hover:bg-green-50/50 transition-all text-left disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium">Abonnement</p>
                <p className="text-xs text-gray-500">Prélèvement mensuel</p>
              </div>
              {loading === 'recurring' ? (
                <Loader2 className="h-4 w-4 animate-spin text-green-500" />
              ) : (
                <span className="text-sm font-bold text-green-600">{recurringAmount}€/mois</span>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
