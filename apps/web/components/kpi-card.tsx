import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  changeLabel?: string;
  changePositive?: boolean;
  loading?: boolean;
}

/** Card de KPI do topo do dashboard (PRD 9.3). */
export function KpiCard({ label, value, changeLabel, changePositive, loading }: KpiCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="skeleton h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold text-slate-50">{value}</p>
        )}
        {changeLabel && !loading && (
          <p
            className={cn(
              'mt-1 text-xs',
              changePositive ? 'text-status-success' : 'text-status-danger',
            )}
          >
            {changeLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
