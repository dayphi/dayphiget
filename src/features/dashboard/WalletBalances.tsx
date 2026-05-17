import { useState } from 'react';
import { Link } from 'react-router';
import { useBudgetStore } from '@/stores/budgetStore';
import { cn, formatRupiah } from '@/lib/utils';
import { ArrowLeftRight, ArrowRight, X } from 'lucide-react';
import { TransferWalletSheet } from './TransferWalletSheet';

interface Props {
  compact?: boolean;
}

export function WalletBalances({ compact = false }: Props) {
  const { walletBalances } = useBudgetStore();
  const [showTransfer, setShowTransfer] = useState(false);

  if (walletBalances.length === 0) return null;

  const totalBalance = walletBalances.reduce((sum, item) => sum + item.balance, 0);

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface-800/50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-surface-200">Saldo Wallet</p>
            <p className={cn('text-lg font-bold tabular-nums', totalBalance < 0 ? 'text-danger-400' : 'text-success-400')}>
              {formatRupiah(totalBalance)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {compact && (
              <Link
                to="/wallet"
                className="flex items-center gap-1 rounded-xl border border-surface-700/50 px-3 py-2 text-xs font-medium text-surface-300 transition-colors hover:border-primary-500/40 hover:text-primary-300"
              >
                Detail
                <ArrowRight size={13} />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setShowTransfer(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-500/30 bg-primary-500/10 text-primary-300 transition-colors hover:bg-primary-500/20"
              aria-label="Transfer wallet"
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>
        </div>
        <div className="divide-y divide-surface-800/50">
          {(compact ? walletBalances.slice(0, 3) : walletBalances).map(({ wallet, balance, income, expense, transferIn, transferOut }) => (
            <div key={wallet.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-800/70 text-lg">
                {wallet.icon || '💳'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-200">{wallet.name}</p>
                <p className="text-[11px] text-surface-500">
                  +{formatRupiah(income + transferIn)} / -{formatRupiah(expense + transferOut)}
                </p>
              </div>
              <p className={cn('text-sm font-semibold tabular-nums', balance < 0 ? 'text-danger-400' : 'text-surface-100')}>
                {formatRupiah(balance)}
              </p>
            </div>
          ))}
          {compact && walletBalances.length > 3 && (
            <Link
              to="/wallet"
              className="flex items-center justify-center gap-1 px-4 py-3 text-xs font-medium text-primary-400 transition-colors hover:text-primary-300"
            >
              Lihat {walletBalances.length - 3} wallet lainnya
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {showTransfer && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowTransfer(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-surface-700/50 bg-surface-900 animate-slide-up safe-bottom">
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-surface-600" />
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h2 className="text-lg font-bold text-surface-100">Transfer Wallet</h2>
              <button
                type="button"
                onClick={() => setShowTransfer(false)}
                className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
              >
                <X size={20} />
              </button>
            </div>
            <TransferWalletSheet onClose={() => setShowTransfer(false)} />
          </div>
        </>
      )}
    </>
  );
}
