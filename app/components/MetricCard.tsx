import { ArrowDownRight, ArrowUpRight, LucideIcon } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function MetricCard({ title, value, detail, trend, icon: Icon }: { title: string; value: string; detail: string; trend?: 'up' | 'down'; icon: LucideIcon }) {
  return (
    <div className="metric-card glass relative overflow-hidden rounded-3xl p-5">
      <div className="pulse-line absolute left-0 top-0 h-px w-full" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</h3>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-blue-700">
          <Icon size={22} />
        </div>
      </div>
      {trend && (
        <div className={cn('mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold', trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          live trend
        </div>
      )}
    </div>
  );
}
