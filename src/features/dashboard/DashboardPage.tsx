
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { SummaryCards } from './SummaryCards';
import { DailySpendingBar } from './DailySpendingBar';
import { ExpenseDonut } from './ExpenseDonut';
import { RecentTransactions } from './RecentTransactions';
import { QuickAddFab } from './QuickAddFab';
import { WalletBalances } from './WalletBalances';
import { Loader2 } from 'lucide-react';
import { cn, formatRupiah } from '@/lib/utils';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const { isLoading, summary } = useBudgetStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      {summary && (
        <section className="rounded-2xl border border-primary-500/15 bg-surface-900/70 p-5">
          <p className="text-sm text-surface-400">
            Halo, <span className="font-medium text-surface-200">{profile?.display_name || 'User'}</span>
          </p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500">Sisa uang bulan ini</p>
              <p className={cn('mt-1 text-3xl font-bold tabular-nums', summary.sisaBudget < 0 ? 'text-danger-400' : 'text-surface-100')}>
                {formatRupiah(summary.sisaBudget)}
              </p>
            </div>
            <div
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
                summary.status === 'healthy' && 'bg-success-500/10 text-success-400',
                summary.status === 'warning' && 'bg-warning-500/10 text-warning-400',
                summary.status === 'deficit' && 'bg-danger-500/10 text-danger-400'
              )}
            >
              {summary.status === 'healthy' ? 'Sehat' : summary.status === 'warning' ? 'Waspada' : 'Deficit'}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-800/40 px-3 py-2">
              <p className="text-xs text-surface-500">Jatah belanja hari ini</p>
              <p className="text-sm font-semibold text-surface-100 tabular-nums">
                {formatRupiah(Math.max(summary.dailyLimit - summary.todaySpent, 0))}
              </p>
            </div>
            <div className="rounded-xl bg-surface-800/40 px-3 py-2">
              <p className="text-xs text-surface-500">Sisa hari bulan ini</p>
              <p className="text-sm font-semibold text-surface-100">{summary.daysRemaining} hari</p>
            </div>
          </div>
        </section>
      )}

      {summary && <SummaryCards summary={summary} />}
      {summary && <DailySpendingBar summary={summary} />}
      <WalletBalances compact />
      <ExpenseDonut />
      <RecentTransactions />
      <QuickAddFab />
    </div>
  );
}
