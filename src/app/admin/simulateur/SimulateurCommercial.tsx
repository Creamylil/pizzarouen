'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

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

  // Commission mois 1 (always earned if deal started)
  const commMois1 = deal.monthly_amount * tauxMois1;

  // Recurring months earned so far (capped at duree)
  const recurringMonthsEarned = Math.min(monthsElapsed + 1, duree + 1); // +1 because month 1 also has recurring
  const commRecurrenteGagnee = recurringMonthsEarned * deal.monthly_amount * tauxRec;

  const totalGagne = commMois1 + commRecurrenteGagnee;

  // Total projected over full period (1 + duree months)
  const totalMoisPeriode = 1 + duree;
  const totalProjection =
    commMois1 +
    totalMoisPeriode * deal.monthly_amount * tauxRec;

  const commRestante = Math.max(0, totalProjection - totalGagne);

  return { commMois1, commRecurrenteGagnee, totalGagne, totalProjection, commRestante, monthsElapsed };
}

export default function SimulateurCommercial({ commercial, deals }: Props) {
  const [nbClients, setNbClients] = useState(5);
  const [montantMoyen, setMontantMoyen] = useState(30);

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

  // Section 3 — simulator (locked rates)
  const simulatorRows = useMemo(() => {
    const totalMonths = 1 + commercial.commission_duration_months;
    let cumul = 0;
    return Array.from({ length: totalMonths }, (_, i) => {
      const mois = i + 1;
      const commMois1 =
        mois === 1 ? nbClients * montantMoyen * (commercial.commission_month1_rate / 100) : 0;
      const commRecurrente = nbClients * montantMoyen * (commercial.commission_recurring_rate / 100);
      const totalMois = commMois1 + commRecurrente;
      cumul += totalMois;
      return { mois, commMois1, commRecurrente, totalMois, cumul };
    });
  }, [nbClients, montantMoyen, commercial]);

  const simulatorTotal = simulatorRows[simulatorRows.length - 1]?.cumul ?? 0;

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
            <p className="text-xs text-gray-500 mb-1">Taux r&eacute;current</p>
            <p className="text-2xl font-bold text-gray-900">{commercial.commission_recurring_rate}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Dur&eacute;e r&eacute;currente</p>
            <p className="text-2xl font-bold text-gray-900">
              {commercial.commission_duration_months} <span className="text-sm font-normal text-gray-500">mois</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 2: Mes gains reels ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Mes gains r&eacute;els</h2>
        {deals.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun abonn&eacute; actif pour le moment.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-gray-500">
                    <th className="py-2 pr-4">Pizzeria</th>
                    <th className="py-2 pr-4 text-right">Montant/mois</th>
                    <th className="py-2 pr-4 text-right">D&eacute;but</th>
                    <th className="py-2 pr-4 text-right">Commission gagn&eacute;e</th>
                    <th className="py-2 text-right">Commission restante</th>
                  </tr>
                </thead>
                <tbody>
                  {dealsWithCommission.map((deal) => (
                    <tr key={deal.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-medium text-gray-700">{deal.pizzeria_name}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{deal.monthly_amount.toFixed(0)} &euro;</td>
                      <td className="py-2 pr-4 text-right tabular-nums text-gray-500">
                        {new Date(deal.subscription_start).toLocaleDateString('fr-FR', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums font-medium text-green-600">
                        {deal.totalGagne.toFixed(2)} &euro;
                      </td>
                      <td className="py-2 text-right tabular-nums text-gray-500">
                        {deal.commRestante.toFixed(2)} &euro;
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={3} className="py-3 font-semibold text-gray-700">Total</td>
                    <td className="py-3 text-right font-bold text-green-600 tabular-nums">
                      {totalGagne.toFixed(2)} &euro;
                    </td>
                    <td className="py-3 text-right font-bold text-gray-500 tabular-nums">
                      {(totalProjection - totalGagne).toFixed(2)} &euro;
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-3 flex gap-6 text-sm">
              <p className="text-gray-500">
                Total gagn&eacute; : <span className="font-semibold text-green-600">{totalGagne.toFixed(2)} &euro;</span>
              </p>
              <p className="text-gray-500">
                Total projet&eacute; : <span className="font-semibold text-indigo-600">{totalProjection.toFixed(2)} &euro;</span>
              </p>
            </div>
          </>
        )}
      </section>

      {/* ── Section 3: Simulateur ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Simulateur</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Nombre de clients</label>
              <Input
                type="number"
                min={1}
                value={nbClients}
                onChange={(e) => setNbClients(parseInt(e.target.value) || 1)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Montant moyen (&euro;/mois)</label>
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
              <label className="text-xs font-medium text-gray-400 mb-1 block">Taux r&eacute;current</label>
              <div className="h-9 flex items-center px-3 bg-gray-100 rounded-md text-sm text-gray-500">
                {commercial.commission_recurring_rate}%
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-gray-500">
                <th className="py-2 pr-4">Mois</th>
                <th className="py-2 pr-4 text-right">Commission mois 1</th>
                <th className="py-2 pr-4 text-right">Commission r&eacute;currente</th>
                <th className="py-2 pr-4 text-right">Total mois</th>
                <th className="py-2 text-right">Cumul</th>
              </tr>
            </thead>
            <tbody>
              {simulatorRows.map((row) => (
                <tr key={row.mois} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium text-gray-700">{row.mois}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {row.commMois1 > 0 ? `${row.commMois1.toFixed(2)} \u20AC` : '\u2014'}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {row.commRecurrente.toFixed(2)} &euro;
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums font-medium">
                    {row.totalMois.toFixed(2)} &euro;
                  </td>
                  <td className="py-2 text-right tabular-nums font-medium text-indigo-600">
                    {row.cumul.toFixed(2)} &euro;
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300">
                <td colSpan={3} className="py-3 font-semibold text-gray-700">
                  Total sur la p&eacute;riode
                </td>
                <td />
                <td className="py-3 text-right font-bold text-lg text-indigo-600 tabular-nums">
                  {simulatorTotal.toFixed(2)} &euro;
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
