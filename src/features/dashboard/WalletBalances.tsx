import { useState } from 'react';
import { Link } from 'react-router';
import { useBudgetStore } from '@/stores/budgetStore';
import { cn, formatRupiah } from '@/lib/utils';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';
import { TransferWalletSheet } from './TransferWalletSheet';
import { PaymentIcon } from '@/components/ui/PaymentIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';


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
                <PaymentIcon icon={wallet.icon} className="w-6 h-6" fallbackClassName="text-lg" />
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

      <BottomSheet
        title="Transfer Wallet"
        isOpen={showTransfer}
        onClose={() => setShowTransfer(false)}
        maxHeight="max-h-[85dvh]"
      >
        <TransferWalletSheet onClose={() => setShowTransfer(false)} />
      </BottomSheet>
    </>
  );
}
