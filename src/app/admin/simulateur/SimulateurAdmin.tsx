'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

export default function SimulateurAdmin() {
  const [tauxMois1, setTauxMois1] = useState(50);
  const [tauxRecurrent, setTauxRecurrent] = useState(20);
  const [dureeRecurrente, setDureeRecurrente] = useState(6);
  const [nbClients, setNbClients] = useState(10);
  const [montantMoyen, setMontantMoyen] = useState(30);

  const rows = useMemo(() => {
    const totalMonths = 1 + dureeRecurrente;
    let cumul = 0;
    return Array.from({ length: totalMonths }, (_, i) => {
      const mois = i + 1;
      const commMois1 = mois === 1 ? nbClients * montantMoyen * (tauxMois1 / 100) : 0;
      const commRecurrente = nbClients * montantMoyen * (tauxRecurrent / 100);
      const totalMois = commMois1 + commRecurrente;
      cumul += totalMois;
      return { mois, commMois1, commRecurrente, totalMois, cumul };
    });
  }, [tauxMois1, tauxRecurrent, dureeRecurrente, nbClients, montantMoyen]);

  const totalCommission = rows[rows.length - 1]?.cumul ?? 0;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
            <label className="text-xs font-medium text-gray-500 mb-1 block">Taux r&eacute;current (%)</label>
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
            <label className="text-xs font-medium text-gray-500 mb-1 block">Dur&eacute;e r&eacute;currente (mois)</label>
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
        </div>
      </div>

      {/* Table */}
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
            {rows.map((row) => (
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
                {totalCommission.toFixed(2)} &euro;
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
