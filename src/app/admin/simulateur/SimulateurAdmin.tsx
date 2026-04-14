'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

const HORIZONS = [6, 12, 24] as const;

export default function SimulateurAdmin() {
  const [tauxMois1, setTauxMois1] = useState(50);
  const [tauxRecurrent, setTauxRecurrent] = useState(20);
  const [dureeRecurrente, setDureeRecurrente] = useState(6);
  const [clientsParMois, setClientsParMois] = useState(3);
  const [montantMoyen, setMontantMoyen] = useState(30);
  const [horizon, setHorizon] = useState<number>(12);

  const { rows, summary } = useMemo(() => {
    const r1 = tauxMois1 / 100;
    const rRec = tauxRecurrent / 100;

    const rowsArr = Array.from({ length: horizon }, (_, i) => {
      const mois = i + 1;

      // Bonus mois 1 : chaque mois on signe clientsParMois nouveaux clients
      const bonusMois1 = clientsParMois * montantMoyen * r1;

      // Commission récurrente : cumule les clients des mois précédents
      // Mois i reçoit la récurrente des clients signés aux mois max(1, i-dureeRecurrente+1)..i
      let recurringTotal = 0;
      for (let signMonth = 1; signMonth <= mois; signMonth++) {
        const monthsSinceSigning = mois - signMonth;
        if (monthsSinceSigning < dureeRecurrente) {
          recurringTotal += clientsParMois * montantMoyen * rRec;
        }
      }

      const totalMois = bonusMois1 + recurringTotal;
      return { mois, bonusMois1, recurringTotal, totalMois };
    });

    // Cumul
    let cumul = 0;
    const rowsWithCumul = rowsArr.map((row) => {
      cumul += row.totalMois;
      return { ...row, cumul };
    });

    const last = rowsWithCumul[rowsWithCumul.length - 1];
    const moyenneMensuelle = last ? last.cumul / horizon : 0;

    return {
      rows: rowsWithCumul,
      summary: {
        revenuMensuelFin: last?.totalMois ?? 0,
        moyenneMensuelle,
        cumulTotal: last?.cumul ?? 0,
      },
    };
  }, [tauxMois1, tauxRecurrent, dureeRecurrente, clientsParMois, montantMoyen, horizon]);

  // Find milestone months (1000€, 2000€, 3000€ /mois)
  const milestones = useMemo(() => {
    const targets = [500, 1000, 2000, 3000];
    return targets
      .map((target) => {
        const row = rows.find((r) => r.totalMois >= target);
        return row ? { target, mois: row.mois } : null;
      })
      .filter(Boolean) as Array<{ target: number; mois: number }>;
  }, [rows]);

  // Max for the bar chart
  const maxRevenuMensuel = Math.max(...rows.map((r) => r.totalMois), 1);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <label className="text-xs font-medium text-gray-500 mb-1 block">Taux mois 1 (%)</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={tauxMois1}
              onChange={(e) => setTauxMois1(parseFloat(e.target.value) || 0)}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Taux récurrent (%)</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={tauxRecurrent}
              onChange={(e) => setTauxRecurrent(parseFloat(e.target.value) || 0)}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Durée récurrente (mois)</label>
            <Input
              type="number"
              min={1}
              max={36}
              value={dureeRecurrente}
              onChange={(e) => setDureeRecurrente(parseInt(e.target.value) || 1)}
              className="h-9"
            />
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div className="flex flex-wrap gap-2">
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
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-amber-400" /> Bonus 1ère commission
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-indigo-500" /> Récurrent cumulé
        </span>
      </div>
    </div>
  );
}
