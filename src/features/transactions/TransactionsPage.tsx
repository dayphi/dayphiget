import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { formatRupiah, formatDate, cn } from '@/lib/utils';
import { Search, Trash2, Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EditTransactionSheet } from './EditTransactionSheet';
import type { Transaction } from '@/types';

export function TransactionsPage() {
  const user = useAuthStore((s) => s.user);
  const { transactions, categories, isLoading, fetchAll, deleteTransaction } = useBudgetStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (user) fetchAll(user.id);
  }, [user, fetchAll]);

  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterCategory && tx.category_id !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        tx.notes?.toLowerCase().includes(q) ||
        tx.category?.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    await deleteTransaction(id);
    setExpandedId(null);
    toast.success('Transaksi dihapus');
  };

  const handleEdit = (tx: Transaction) => {
    setExpandedId(null);
    setEditingTx(tx);
  };

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, tx) => {
    const d = tx.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(tx);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <h2 className="text-lg font-bold text-surface-100">Riwayat Transaksi</h2>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari transaksi..."
          className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-3 pl-10 pr-4 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'expense', 'income'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              'flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
              filterType === t
                ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                : 'border-surface-700/50 text-surface-400 hover:border-surface-600'
            )}
          >
            {t === 'all' ? 'Semua' : t === 'expense' ? '💸 Pengeluaran' : '💰 Pemasukan'}
          </button>
        ))}
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-shrink-0 rounded-lg border border-surface-700/50 bg-surface-800/50 px-3 py-1.5 text-xs text-surface-400 outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="glass-card py-12 text-center">
          <p className="text-3xl mb-2">{search ? '🔍' : '📝'}</p>
          <p className="text-sm text-surface-400">
            {search ? 'Tidak ditemukan' : 'Belum ada transaksi'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="mb-2 text-xs font-medium text-surface-500">
                {formatDate(date, 'long')}
              </p>
              <div className="glass-card divide-y divide-surface-800/50">
                {txs.map((tx) => {
                  const isExpanded = expandedId === tx.id;
                  return (
                    <div key={tx.id} className="overflow-hidden">
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                          isExpanded ? 'bg-surface-800/30' : 'active:bg-surface-800/20'
                        )}
                      >
                        <div
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                          style={{
                            backgroundColor: `${tx.category?.color || '#6366f1'}15`,
                          }}
                        >
                          {tx.category?.icon || '📦'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-surface-200">
                            {tx.category?.name || 'Lainnya'}
                          </p>
                          {tx.notes && (
                            <p className="truncate text-xs text-surface-500">{tx.notes}</p>
                          )}
                        </div>
                        <p
                          className={cn(
                            'text-sm font-semibold tabular-nums',
                            tx.type === 'income' ? 'text-success-400' : 'text-surface-200'
                          )}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatRupiah(tx.amount)}
                        </p>
                      </div>

                      {/* Action buttons — shown when tapped */}
                      {isExpanded && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-800/20 animate-fade-in">
                          {tx.payment_method && (
                            <span className="mr-auto text-xs text-surface-500">
                              {tx.payment_method.icon} {tx.payment_method.name}
                            </span>
                          )}
                          {!tx.payment_method && <span className="mr-auto" />}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(tx); }}
                            className="flex items-center gap-1.5 rounded-lg border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 text-xs font-medium text-primary-400 transition-all hover:bg-primary-500/20"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                            className="flex items-center gap-1.5 rounded-lg border border-danger-500/30 bg-danger-500/10 px-3 py-1.5 text-xs font-medium text-danger-400 transition-all hover:bg-danger-500/20"
                          >
                            <Trash2 size={12} />
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Sheet */}
      {editingTx && (
        <EditTransactionSheet
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
}
