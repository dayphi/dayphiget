import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { SummaryCards } from './SummaryCards';
import { DailySpendingBar } from './DailySpendingBar';
import { ExpenseDonut } from './ExpenseDonut';
import { RecentTransactions } from './RecentTransactions';
import { QuickAddFab } from './QuickAddFab';
import { Loader2 } from 'lucide-react';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const { isLoading, fetchAll, summary } = useBudgetStore();

  useEffect(() => {
    if (user) {
      fetchAll(user.id);
    }
  }, [user, fetchAll]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      {/* Greeting */}
      <div className="pt-1">
        <p className="text-sm text-surface-400">
          Halo, <span className="font-medium text-surface-200">{profile?.display_name || 'User'}</span> 👋
        </p>
        <p className="text-xs text-surface-500">Ringkasan keuangan bulan ini</p>
      </div>

      {/* Summary Cards */}
      {summary && <SummaryCards summary={summary} />}

      {/* Daily Spending Indicator */}
      {summary && <DailySpendingBar summary={summary} />}

      {/* Expense Donut */}
      <ExpenseDonut />

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* FAB */}
      <QuickAddFab />
    </div>
  );
}
