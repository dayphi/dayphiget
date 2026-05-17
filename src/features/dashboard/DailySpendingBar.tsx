import { formatRupiah, cn, calcPercent } from '@/lib/utils';
import type { DashboardSummary } from '@/types';

interface Props {
  summary: DashboardSummary;
}

export function DailySpendingBar({ summary }: Props) {
  const { dailyLimit, todaySpent, daysRemaining } = summary;
  const percent = calcPercent(todaySpent, dailyLimit);

  const barColor =
    percent >= 100
      ? 'bg-danger-500'
      : percent >= 80
      ? 'bg-warning-500'
      : 'bg-success-500';

  const barGlow =
    percent >= 100
      ? 'shadow-danger-500/30'
      : percent >= 80
      ? 'shadow-warning-500/30'
      : 'shadow-success-500/30';

  return (
    <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '240ms' }}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-surface-400">Sisa Hari Ini</p>
          <p className={cn(
            'text-xl font-bold tabular-nums',
            dailyLimit - todaySpent < 0 ? 'text-danger-400' : 'text-surface-100'
          )}>
            {formatRupiah(Math.max(dailyLimit - todaySpent, 0))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-surface-500">{daysRemaining} hari lagi</p>
          <p className="text-xs text-surface-400">
            Limit: <span className="font-medium text-surface-300">{formatRupiah(dailyLimit)}</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-800">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out shadow-sm',
            barColor,
            barGlow
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs text-surface-500">
        <span>Terpakai: {formatRupiah(todaySpent)}</span>
        <span className={cn(
          'font-medium',
          percent >= 100 ? 'text-danger-400' : percent >= 80 ? 'text-warning-400' : 'text-success-400'
        )}>
          {percent}%
        </span>
      </div>
    </div>
  );
}
