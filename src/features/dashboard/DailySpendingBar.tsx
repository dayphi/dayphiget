import { formatRupiah, cn, calcPercent } from '@/lib/utils';
import type { DashboardSummary } from '@/types';

interface Props {
  summary: DashboardSummary;
}

export function DailySpendingBar({ summary }: Props) {
  const { dailyLimit, todaySpent, daysRemaining, sisaBudget, totalIncome, totalExpense } = summary;
  const percent = calcPercent(todaySpent, dailyLimit);
  const budgetPercent = totalIncome > 0 ? calcPercent(totalExpense, totalIncome) : 0;

  const barColor =
    percent >= 100
      ? 'bg-danger-500'
      : percent >= 80
      ? 'bg-warning-500'
      : 'bg-success-500';

  const remaining = dailyLimit - todaySpent;

  return (
    <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '240ms' }}>
      {/* Total Remaining Budget */}
      <div className="glass-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-surface-400">Sisa Budget Bulan Ini</p>
          <p className="text-xs text-surface-500">{daysRemaining} hari tersisa</p>
        </div>
        <p className={cn(
          'text-2xl font-bold tabular-nums',
          sisaBudget < 0 ? 'text-danger-400' : 'text-surface-100'
        )}>
          {formatRupiah(sisaBudget)}
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-800">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700',
              budgetPercent >= 100 ? 'bg-danger-500' : budgetPercent >= 80 ? 'bg-warning-500' : 'bg-primary-500'
            )}
            style={{ width: `${Math.min(budgetPercent, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-surface-500">
          Terpakai {formatRupiah(totalExpense)} dari {formatRupiah(totalIncome)} ({budgetPercent}%)
        </p>
      </div>

      {/* Daily Limit */}
      <div className="glass-card p-4">
        <p className="mb-2 text-xs text-surface-500">
          Limit harian = sisa budget ÷ {daysRemaining} hari
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-400">Boleh belanja hari ini</p>
            <p className={cn(
              'text-xl font-bold tabular-nums',
              remaining < 0 ? 'text-danger-400' : 'text-surface-100'
            )}>
              {formatRupiah(Math.max(remaining, 0))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-surface-400">
              Limit: <span className="font-medium text-surface-300">{formatRupiah(dailyLimit)}</span>
            </p>
            <p className="text-xs text-surface-400">
              Terpakai: <span className="font-medium text-surface-300">{formatRupiah(todaySpent)}</span>
            </p>
          </div>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-800">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 ease-out',
              barColor
            )}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs">
          <span className={cn(
            'font-medium',
            percent >= 100 ? 'text-danger-400' : percent >= 80 ? 'text-warning-400' : 'text-success-400'
          )}>
            {percent}%
          </span>
        </p>
      </div>
    </div>
  );
}
