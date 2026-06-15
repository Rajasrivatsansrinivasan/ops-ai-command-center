import { ScoredPoint } from '@/app/lib/types';
import { SeverityBadge } from './SeverityBadge';
import { fmt } from '@/app/lib/utils';

export function AssetTable({ rows, onSelect, selectedSite }: { rows: ScoredPoint[]; selectedSite: string; onSelect: (siteId: string) => void }) {
  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="border-b border-slate-200/70 p-5">
        <h3 className="text-lg font-semibold text-slate-950">Monitored assets</h3>
        <p className="text-sm text-slate-500">Click a row to inspect live telemetry and model outputs.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Asset</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Availability</th>
              <th className="px-5 py-3">Utilization</th>
              <th className="px-5 py-3">Error rate</th>
              <th className="px-5 py-3">AI score</th>
              <th className="px-5 py-3">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {rows.map(row => (
              <tr key={row.siteId} onClick={() => onSelect(row.siteId)} className={`cursor-pointer transition hover:bg-blue-50/60 ${selectedSite === row.siteId ? 'bg-blue-50/80' : 'bg-white/40'}`}>
                <td className="px-5 py-4 font-semibold text-slate-900">{row.siteId}<div className="text-xs font-normal text-slate-500">{row.region}</div></td>
                <td className="px-5 py-4 text-slate-600">{row.assetType}</td>
                <td className="px-5 py-4 text-slate-700">{fmt(row.availability)}%</td>
                <td className="px-5 py-4 text-slate-700">{fmt(row.utilization)}%</td>
                <td className="px-5 py-4 text-slate-700">{fmt(row.errorRate, 2)}%</td>
                <td className="px-5 py-4 font-semibold text-slate-900">{Math.round(row.anomalyScore)}</td>
                <td className="px-5 py-4"><SeverityBadge severity={row.severity} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
