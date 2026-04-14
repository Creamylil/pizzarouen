import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllCommercials } from '../actions/crm';
import { requireAdmin } from '@/lib/auth/require-role';
import CommercialForm from './CommercialForm';
import ToggleActiveButton from './ToggleActiveButton';
import { Users } from 'lucide-react';

export default async function CommercialsPage() {
  await requireAdmin();

  const commercials = await getAllCommercials();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Commerciaux</h1>
          <p className="text-sm text-gray-500 mt-1">
            {commercials.filter((c) => c.active).length} actif{commercials.filter((c) => c.active).length > 1 ? 's' : ''} sur {commercials.length} total
          </p>
        </div>
        <CommercialForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Équipe commerciale
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commercials.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">Aucun commercial enregistré.</p>
          ) : (
            <div className="divide-y">
              {commercials.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between py-3 first:pt-0 last:pb-0 ${
                    !c.active ? 'opacity-50' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      {!c.active && (
                        <Badge variant="outline" className="text-xs">Inactif</Badge>
                      )}
                      {c.user_id && (
                        <Badge variant="secondary" className="text-xs">Compte lié</Badge>
                      )}
                      {c.can_see_all_deals && (
                        <Badge variant="default" className="text-xs">Voir tout</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      {c.email && <span>{c.email}</span>}
                      {c.phone && <span>{c.phone}</span>}
                    </div>
                    {(c.commission_month1_rate != null || c.commission_recurring_rate != null || c.commission_duration_months != null) && (
                      <div className="text-xs text-indigo-600 mt-1">
                        {[
                          c.commission_month1_rate != null ? `${c.commission_month1_rate}% M1` : null,
                          c.commission_recurring_rate != null ? `${c.commission_recurring_rate}% récurrent` : null,
                          c.commission_duration_months != null ? `${c.commission_duration_months} mois` : null,
                        ].filter(Boolean).join(' / ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <CommercialForm existing={c} />
                    <ToggleActiveButton id={c.id} active={c.active} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
