'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { generatePaymentLink } from '../../actions/crm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        toast.success('Lien copié dans le presse-papiers !', {
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Lien de paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dernier lien généré */}
        {lastPaymentLink && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-medium text-green-700 mb-2">Dernier lien généré</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-green-800 bg-green-100 rounded px-2 py-1.5 truncate block">
                {lastPaymentLink}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 h-8 w-8 p-0 text-green-700 hover:text-green-900 hover:bg-green-100"
                onClick={() => handleCopyLink(lastPaymentLink)}
                title="Copier le lien"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <a
                href={lastPaymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-green-700 hover:text-green-900 hover:bg-green-100 transition-colors"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Bouton générer */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Link2 className="h-4 w-4 mr-2" />
              {lastPaymentLink ? 'Générer un nouveau lien' : 'Générer un lien de paiement'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Générer un lien de paiement</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-500 mb-4">
              Choisissez le type de paiement pour la formule{' '}
              <span className="font-medium text-gray-700">{pricingPlan}</span>.
            </p>
            <div className="space-y-3">
              {/* Paiement unique */}
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

              {/* Abonnement récurrent */}
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
      </CardContent>
    </Card>
  );
}
