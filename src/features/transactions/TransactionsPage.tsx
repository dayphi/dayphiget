import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { formatRupiah, formatDate, cn } from '@/lib/utils';
import { Search, Trash2, Pencil, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { EditTransactionSheet } from './EditTransactionSheet';
import type { Transaction } from '@/types';
import { PaymentIcon } from '@/components/ui/PaymentIcon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function TransactionsPage() {
  const user = useAuthStore((s) => s.user);
  const {
    transactionHistory,
    categories,
    isHistoryLoading,
    fetchTransactionHistory,
    deleteTransaction,
  } = useBudgetStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;

    fetchTransactionHistory(user.id).catch((err) => {
      toast.error(err instanceof Error ? err.message : 'Gagal mengambil riwayat transaksi');
    });
  }, [user, fetchTransactionHistory]);

  const filtered = transactionHistory.filter((tx) => {
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

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteTransaction(deletingId);
      setExpandedId(null);
      toast.success('Transaksi dihapus');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus');
    }
    setDeletingId(null);
  };

  const handleEdit = (tx: Transaction) => {
    setExpandedId(null);
    setEditingTx(tx);
  };

  // Group by month
  const groupedByMonth = filtered.reduce<Record<string, typeof filtered>>((acc, tx) => {
    const month = tx.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(tx);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));
  const latestMonth = sortedMonths[0];

  const isMonthCollapsed = (month: string) => {
    if (collapsedMonths[month] !== undefined) {
      return collapsedMonths[month];
    }
    return month !== latestMonth;
  };

  const toggleMonth = (month: string) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [month]: !isMonthCollapsed(month),
    }));
  };

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
      {isHistoryLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : sortedMonths.length === 0 ? (
        <div className="glass-card py-12 text-center">
          <p className="text-3xl mb-2">{search ? '🔍' : '📝'}</p>
          <p className="text-sm text-surface-400">
            {search ? 'Tidak ditemukan' : 'Belum ada transaksi'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {sortedMonths.map((month) => {
            const isCollapsed = isMonthCollapsed(month);
            const txsInMonth = groupedByMonth[month];

            // Generate month name e.g., "Mei 2026"
            const monthDate = new Date(`${month}-01T00:00:00`);
            const monthName = monthDate.toLocaleDateString('id-ID', {
              month: 'long',
              year: 'numeric',
            });

            // Group by date inside the month
            const groupedByDate = txsInMonth.reduce<Record<string, typeof txsInMonth>>((acc, tx) => {
              if (!acc[tx.date]) acc[tx.date] = [];
              acc[tx.date].push(tx);
              return acc;
            }, {});
            const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

            return (
              <div key={month} className="flex flex-col gap-3">
                <button
                  onClick={() => toggleMonth(month)}
                  className="flex items-center w-full gap-2 text-sm font-semibold text-surface-300 hover:text-surface-200 transition-colors"
                >
                  {isCollapsed ? <ChevronRight size={16} className="text-surface-500" /> : <ChevronDown size={16} className="text-surface-500" />}
                  {monthName}
                  <span className="ml-auto text-xs font-normal text-surface-500 bg-surface-800/50 px-2 py-0.5 rounded-full">
                    {txsInMonth.length} transaksi
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="flex flex-col gap-4 pl-1">
                    {sortedDates.map((date) => (
                      <div key={date}>
                        <p className="mb-2 text-xs font-medium text-surface-500">
                          {formatDate(date, 'long')}
                        </p>
                        <div className="glass-card divide-y divide-surface-800/50">
                          {groupedByDate[date].map((tx) => {
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
                                      <span className="mr-auto flex items-center gap-1.5 text-xs text-surface-500">
                                        <PaymentIcon icon={tx.payment_method.icon} className="w-3.5 h-3.5" fallbackClassName="text-sm" />
                                        {tx.payment_method.name}
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
                                      onClick={(e) => { e.stopPropagation(); setDeletingId(tx.id); }}
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
              </div>
            );
          })}
        </div>
      )}

      {editingTx && (
        <EditTransactionSheet
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        description="Apakah Anda yakin ingin menghapus transaksi ini? Saldo wallet akan dikembalikan seperti sebelum transaksi ini terjadi."
        confirmText="Hapus Transaksi"
      />
    </div>
  );
}
