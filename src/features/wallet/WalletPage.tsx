import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { WalletBalances } from '@/features/dashboard/WalletBalances';
import { cn, formatRupiah } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';

export function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const { isLoading, fetchAll, walletTransfers, walletBalances } = useBudgetStore();

  useEffect(() => {
    if (user) fetchAll(user.id);
  }, [user, fetchAll]);

  const totalBalance = walletBalances.reduce((sum, item) => sum + item.balance, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      <section className="rounded-2xl border border-primary-500/15 bg-surface-900/70 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-surface-500">Total Saldo</p>
        <p className={cn('mt-1 text-3xl font-bold tabular-nums', totalBalance < 0 ? 'text-danger-400' : 'text-surface-100')}>
          {formatRupiah(totalBalance)}
        </p>
        <p className="mt-2 text-xs text-surface-500">
          Saldo dihitung dari saldo awal, pemasukan, pengeluaran, dan transfer antar wallet bulan ini.
        </p>
      </section>

      <WalletBalances />

      <section className="glass-card overflow-hidden">
        <div className="border-b border-surface-800/50 px-4 py-3">
          <h2 className="text-sm font-semibold text-surface-200">Transfer Terakhir</h2>
        </div>
        {walletTransfers.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-surface-500">Belum ada transfer wallet bulan ini</p>
        ) : (
          <div className="divide-y divide-surface-800/50">
            {walletTransfers.slice(0, 10).map((transfer) => (
              <div key={transfer.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
                  <ArrowUpRight size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-surface-200">
                    {transfer.from_payment_method?.name || 'Wallet'} ke {transfer.to_payment_method?.name || 'Wallet'}
                  </p>
                  <p className="truncate text-xs text-surface-500">{transfer.notes || transfer.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-surface-100">{formatRupiah(Number(transfer.amount))}</p>
                  <div className="flex justify-end text-surface-500">
                    <ArrowDownLeft size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
