import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { formatRupiah, formatDate, cn } from '@/lib/utils';
import { Search, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function TransactionsPage() {
  const user = useAuthStore((s) => s.user);
  const { transactions, categories, isLoading, fetchAll, deleteTransaction } = useBudgetStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');

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
    toast.success('Transaksi dihapus');
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
                {txs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 px-4 py-3 group"
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
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
