import { IncidentSummary } from '@/app/lib/types';
import { SeverityBadge } from './SeverityBadge';

export function IncidentPanel({ incidents }: { incidents: IncidentSummary[] }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">AI incident triage</h3>
          <p className="text-sm text-slate-500">Auto-generated narratives, probable drivers, and action plans.</p>
        </div>
      </div>
      <div className="space-y-4">
        {incidents.length === 0 && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">No active incidents. All assets are within learned baseline limits.</p>}
        {incidents.map(incident => (
          <div key={incident.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-slate-950">{incident.title}</h4>
                <p className="mt-1 text-xs text-slate-500">Started {new Date(incident.startedAt).toLocaleString()}</p>
              </div>
              <SeverityBadge severity={incident.severity} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{incident.narrative}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Probable drivers</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {incident.probableDrivers.map(driver => <li key={driver}>• {driver}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Action plan</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {incident.actionPlan.map(action => <li key={action}>• {action}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
