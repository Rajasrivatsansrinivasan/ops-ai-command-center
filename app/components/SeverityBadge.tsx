import { ScoredPoint } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';

export function SeverityBadge({ severity }: { severity: ScoredPoint['severity'] }) {
  return (
    <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold',
      severity === 'Critical' && 'border-rose-200 bg-rose-50 text-rose-700',
      severity === 'Warning' && 'border-amber-200 bg-amber-50 text-amber-700',
      severity === 'Watch' && 'border-blue-200 bg-blue-50 text-blue-700',
      severity === 'Normal' && 'border-emerald-200 bg-emerald-50 text-emerald-700')}>{severity}</span>
  );
}
