import { formatRupiah, cn, calcPercent } from '@/lib/utils';
import type { DashboardSummary } from '@/types';

interface Props {
  summary: DashboardSummary;
}

export function DailySpendingBar({ summary }: Props) {
  const {
    dailyLimit,
    todaySpent,
    daysRemaining,
    remainingSpendBudget,
    remainingSavingsBudget,
    remainingHutang,
    dailyLimitSource,
  } = summary;
  const percent = calcPercent(todaySpent, dailyLimit);
  const remaining = dailyLimit - todaySpent;

  const barColor =
    percent >= 100
      ? 'bg-danger-500'
      : percent >= 80
      ? 'bg-warning-500'
      : 'bg-success-500';

  return (
    <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '180ms' }}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-surface-400">Jatah belanja hari ini</p>
          <p
            className={cn(
              'mt-1 text-xl font-bold tabular-nums',
              remaining < 0 ? 'text-danger-400' : 'text-surface-100'
            )}
          >
            {formatRupiah(Math.max(remaining, 0))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-surface-500">{daysRemaining} hari tersisa</p>
          <p className="text-xs text-surface-400">
            Terpakai {formatRupiah(todaySpent)}
          </p>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-800">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor)}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <InfoBox label="Sisa budget belanja" value={remainingSpendBudget} />
        <InfoBox label="Target tabungan" value={remainingSavingsBudget} />
        <InfoBox label="Cicilan belum bayar" value={remainingHutang} />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-surface-500">
        {dailyLimitSource === 'budget'
          ? 'Jatah harian dihitung dari sisa budget kategori belanja. Target tabungan dan cicilan dipisahkan.'
          : 'Belum ada budget belanja, jadi jatah harian dihitung dari sisa uang periode ini.'}
      </p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-800/40 px-2 py-2">
      <p className="text-[10px] leading-tight text-surface-500">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold tabular-nums text-surface-200" title={formatRupiah(value)}>
        {formatRupiah(value)}
      </p>
    </div>
  );
}
