'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

const HORIZONS = [6, 12, 24] as const;

interface Props {
  commercial: {
    name: string;
    commission_month1_rate: number;
    commission_recurring_rate: number;
    commission_duration_months: number;
  };
  deals: Array<{
    id: string;
    pizzeria_name: string;
    monthly_amount: number;
    subscription_start: string;
  }>;
}

function monthsDiff(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diff =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(0, diff);
}

function computeDealCommission(
  deal: Props['deals'][0],
  commercial: Props['commercial']
) {
  const monthsElapsed = monthsDiff(deal.subscription_start);
  const tauxMois1 = commercial.commission_month1_rate / 100;
  const tauxRec = commercial.commission_recurring_rate / 100;
  const duree = commercial.commission_duration_months;

  const commMois1 = deal.monthly_amount * tauxMois1;
  const recurringMonthsEarned = Math.min(monthsElapsed + 1, duree + 1);
  const commRecurrenteGagnee = recurringMonthsEarned * deal.monthly_amount * tauxRec;
  const totalGagne = commMois1 + commRecurrenteGagnee;

  const totalMoisPeriode = 1 + duree;
  const totalProjection = commMois1 + totalMoisPeriode * deal.monthly_amount * tauxRec;
  const commRestante = Math.max(0, totalProjection - totalGagne);

  return { commMois1, commRecurrenteGagnee, totalGagne, totalProjection, commRestante, monthsElapsed };
}

export default function SimulateurCommercial({ commercial, deals }: Props) {
  const [clientsParMois, setClientsParMois] = useState(3);
  const [montantMoyen, setMontantMoyen] = useState(30);
  const [horizon, setHorizon] = useState<number>(12);

  // Section 2 — real gains
  const dealsWithCommission = useMemo(
    () =>
      deals.map((deal) => ({
        ...deal,
        ...computeDealCommission(deal, commercial),
      })),
    [deals, commercial]
  );

  const totalGagne = dealsWithCommission.reduce((s, d) => s + d.totalGagne, 0);
  const totalProjection = dealsWithCommission.reduce((s, d) => s + d.totalProjection, 0);

  // Section 3 — continuous acquisition simulator (locked rates)
  const { rows, summary, milestones } = useMemo(() => {
    const r1 = commercial.commission_month1_rate / 100;
    const rRec = commercial.commission_recurring_rate / 100;
    const duree = commercial.commission_duration_months;

    const rowsArr = Array.from({ length: horizon }, (_, i) => {
      const mois = i + 1;
      const bonusMois1 = clientsParMois * montantMoyen * r1;

      let recurringTotal = 0;
      for (let signMonth = 1; signMonth <= mois; signMonth++) {
        const monthsSinceSigning = mois - signMonth;
        if (monthsSinceSigning < duree) {
          recurringTotal += clientsParMois * montantMoyen * rRec;
        }
      }

      const totalMois = bonusMois1 + recurringTotal;
      return { mois, bonusMois1, recurringTotal, totalMois };
    });

    let cumul = 0;
    const rowsWithCumul = rowsArr.map((row) => {
      cumul += row.totalMois;
      return { ...row, cumul };
    });

    const last = rowsWithCumul[rowsWithCumul.length - 1];
    const moyenneMensuelle = last ? last.cumul / horizon : 0;

    const targets = [500, 1000, 2000, 3000];
    const ms = targets
      .map((target) => {
        const row = rowsWithCumul.find((r) => r.totalMois >= target);
        return row ? { target, mois: row.mois } : null;
      })
      .filter(Boolean) as Array<{ target: number; mois: number }>;

    return {
      rows: rowsWithCumul,
      summary: {
        revenuMensuelFin: last?.totalMois ?? 0,
        moyenneMensuelle,
        cumulTotal: last?.cumul ?? 0,
      },
      milestones: ms,
    };
  }, [clientsParMois, montantMoyen, horizon, commercial]);

  const maxRevenuMensuel = Math.max(...rows.map((r) => r.totalMois), 1);

  return (
    <div className="space-y-8">
      {/* ── Section 1: Mes taux ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Mes taux</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Taux mois 1</p>
            <p className="text-2xl font-bold text-gray-900">{commercial.commission_month1_rate}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Taux récurrent</p>
            <p className="text-2xl font-bold text-gray-900">{commercial.commission_recurring_rate}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Durée récurrente</p>
            <p className="text-2xl font-bold text-gray-900">
              {commercial.commission_duration_months} <span className="text-sm font-normal text-gray-500">mois</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 2: Mes gains réels ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Mes gains réels</h2>
        {deals.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun abonné actif pour le moment.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-gray-500">
                    <th className="py-2 pr-4">Pizzeria</th>
                    <th className="py-2 pr-4 text-right">Montant/mois</th>
                    <th className="py-2 pr-4 text-right">Début</th>
                    <th className="py-2 pr-4 text-right">Commission gagnée</th>
                    <th className="py-2 text-right">Commission restante</th>
                  </tr>
                </thead>
                <tbody>
                  {dealsWithCommission.map((deal) => (
                    <tr key={deal.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-medium text-gray-700">{deal.pizzeria_name}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{deal.monthly_amount.toFixed(0)} €</td>
                      <td className="py-2 pr-4 text-right tabular-nums text-gray-500">
                        {new Date(deal.subscription_start).toLocaleDateString('fr-FR', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums font-medium text-green-600">
                        {deal.totalGagne.toFixed(2)} €
                      </td>
                      <td className="py-2 text-right tabular-nums text-gray-500">
                        {deal.commRestante.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={3} className="py-3 font-semibold text-gray-700">Total</td>
                    <td className="py-3 text-right font-bold text-green-600 tabular-nums">
                      {totalGagne.toFixed(2)} €
                    </td>
                    <td className="py-3 text-right font-bold text-gray-500 tabular-nums">
                      {(totalProjection - totalGagne).toFixed(2)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-3 flex gap-6 text-sm">
              <p className="text-gray-500">
                Total gagné : <span className="font-semibold text-green-600">{totalGagne.toFixed(2)} €</span>
              </p>
              <p className="text-gray-500">
                Total projeté : <span className="font-semibold text-indigo-600">{totalProjection.toFixed(2)} €</span>
              </p>
            </div>
          </>
        )}
      </section>

      {/* ── Section 3: Simulateur continu ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Simulateur — Si je continue à signer…
        </h2>

        {/* Inputs */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Clients / mois</label>
              <Input
                type="number"
                min={1}
                value={clientsParMois}
                onChange={(e) => setClientsParMois(parseInt(e.target.value) || 1)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Montant moyen (€/mois)</label>
              <Input
                type="number"
                min={0}
                step={5}
                value={montantMoyen}
                onChange={(e) => setMontantMoyen(parseFloat(e.target.value) || 0)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Taux mois 1</label>
              <div className="h-9 flex items-center px-3 bg-gray-100 rounded-md text-sm text-gray-500">
                {commercial.commission_month1_rate}%
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Horizon</label>
              <div className="flex gap-1">
                {HORIZONS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                      horizon === h
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {h}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <p className="text-xs text-indigo-600 font-medium mb-1">Revenu mensuel à {horizon} mois</p>
            <p className="text-3xl font-bold text-indigo-700">{summary.revenuMensuelFin.toFixed(0)} €</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">Moyenne mensuelle</p>
            <p className="text-3xl font-bold text-gray-700">{summary.moyenneMensuelle.toFixed(0)} €</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-xs text-green-600 font-medium mb-1">Total cumulé sur {horizon} mois</p>
            <p className="text-3xl font-bold text-green-700">{summary.cumulTotal.toFixed(0)} €</p>
          </div>
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {milestones.map(({ target, mois }) => (
              <span
                key={target}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200"
              >
                🎯 {target} €/mois atteint au mois {mois}
              </span>
            ))}
          </div>
        )}

        {/* Bar chart + Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-gray-500">
                <th className="py-2 pr-4 w-16">Mois</th>
                <th className="py-2 pr-4">Revenu mensuel</th>
                <th className="py-2 pr-4 text-right w-28">Bonus M1</th>
                <th className="py-2 pr-4 text-right w-28">Récurrent</th>
                <th className="py-2 pr-4 text-right w-28">Total/mois</th>
                <th className="py-2 text-right w-28">Cumul</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const pctBonus = row.totalMois > 0 ? (row.bonusMois1 / row.totalMois) * 100 : 0;
                const pctRec = 100 - pctBonus;
                const barWidth = (row.totalMois / maxRevenuMensuel) * 100;

                return (
                  <tr key={row.mois} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-700">{row.mois}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full flex overflow-hidden"
                            style={{ width: `${barWidth}%` }}
                          >
                            <div
                              className="h-full bg-amber-400"
                              style={{ width: `${pctBonus}%` }}
                            />
                            <div
                              className="h-full bg-indigo-500"
                              style={{ width: `${pctRec}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-amber-600">
                      {row.bonusMois1.toFixed(0)} €
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-indigo-600">
                      {row.recurringTotal.toFixed(0)} €
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums font-medium">
                      {row.totalMois.toFixed(0)} €
                    </td>
                    <td className="py-2 text-right tabular-nums font-medium text-green-600">
                      {row.cumul.toFixed(0)} €
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-amber-400" /> Bonus 1ère commission
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-indigo-500" /> Récurrent cumulé
          </span>
        </div>
      </section>
    </div>
  );
}
