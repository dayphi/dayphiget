import { useBudgetStore } from '@/stores/budgetStore';
import { formatRupiah, timeAgo, cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export function RecentTransactions() {
  const { transactions } = useBudgetStore();
  const recent = transactions.slice(0, 5);

  return (
    <div className="glass-card animate-slide-up" style={{ animationDelay: '360ms' }}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-surface-300">
          Transaksi Terakhir
        </h3>
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
        >
          Lihat Semua
          <ArrowRight size={14} />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm text-surface-400">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="divide-y divide-surface-800/50">
          {recent.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-800/30"
            >
              {/* Category icon */}
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                style={{
                  backgroundColor: `${tx.category?.color || '#6366f1'}15`,
                }}
              >
                {tx.category?.icon || '📦'}
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-200">
                  {tx.category?.name || 'Uncategorized'}
                </p>
                <p className="truncate text-xs text-surface-500">
                  {tx.notes || timeAgo(tx.created_at)}
                </p>
              </div>

              {/* Amount */}
              <p
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  tx.type === 'income'
                    ? 'text-success-400'
                    : 'text-surface-200'
                )}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatRupiah(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
