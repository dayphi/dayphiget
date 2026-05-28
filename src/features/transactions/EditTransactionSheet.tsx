import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { cn } from '@/lib/utils';
import { Loader2, X } from 'lucide-react';
import { RupiahInput } from '@/components/ui/RupiahInput';
import { toast } from 'sonner';
import type { Transaction, TransactionType } from '@/types';
import { PaymentIcon } from '@/components/ui/PaymentIcon';


interface Props {
  transaction: Transaction;
  onClose: () => void;
}

export function EditTransactionSheet({ transaction, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const { categories, paymentMethods, updateTransaction, fetchCategories, fetchPaymentMethods } = useBudgetStore();

  useEffect(() => {
    if (user && categories.length === 0) fetchCategories(user.id);
    if (user && paymentMethods.length === 0) fetchPaymentMethods(user.id);
  }, [user, categories.length, paymentMethods.length, fetchCategories, fetchPaymentMethods]);

  const [type, setType] = useState<TransactionType>(transaction.type);
  const [categoryId, setCategoryId] = useState(transaction.category_id);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [date, setDate] = useState(transaction.date);
  const [paymentMethodId, setPaymentMethodId] = useState(transaction.payment_method_id || '');
  const [notes, setNotes] = useState(transaction.notes || '');
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'tabungan' : true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !categoryId) return;

    setLoading(true);
    try {
      await updateTransaction(transaction.id, {
        category_id: categoryId,
        payment_method_id: paymentMethodId || null,
        type,
        amount: parseFloat(amount),
        date,
        notes: notes || null,
      });
      toast.success('Transaksi diperbarui! ✅');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="bottom-sheet-overlay"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-surface-900 border-t border-surface-700/50 animate-slide-up safe-bottom">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-surface-600" />
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-lg font-bold text-surface-100">Edit Transaksi</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pb-8 pt-2">
          {/* Type Toggle */}
          <div className="flex gap-2 rounded-xl bg-surface-800/50 p-1">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategoryId(''); }}
                className={cn(
                  'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200',
                  type === t
                    ? t === 'expense'
                      ? 'bg-danger-500/20 text-danger-400 shadow-sm'
                      : 'bg-success-500/20 text-success-400 shadow-sm'
                    : 'text-surface-400 hover:text-surface-300'
                )}
              >
                {t === 'expense' ? '💸 Pengeluaran' : '💰 Pemasukan'}
              </button>
            ))}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-300">Kategori *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Pilih kategori...</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon || '📦'} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-300">Jumlah *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">
                Rp
              </span>
              <RupiahInput
                value={amount}
                onChange={setAmount}
                placeholder="0"
                required
                className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-3 pl-12 pr-4 text-lg font-bold tabular-nums text-surface-100 placeholder:text-surface-600 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-300">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Wallet */}
          {paymentMethods.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-surface-300">
                {type === 'income' ? 'Masuk ke Wallet' : 'Bayar dari Wallet'}
              </label>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() =>
                      setPaymentMethodId(paymentMethodId === pm.id ? '' : pm.id)
                    }
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-all',
                      paymentMethodId === pm.id
                        ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                        : 'border-surface-700/50 text-surface-400 hover:border-surface-600'
                    )}
                  >
                    <PaymentIcon icon={pm.icon} className="w-3.5 h-3.5" fallbackClassName="text-sm" /> {pm.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-300">Catatan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail transaksi (opsional)"
              className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !amount || !categoryId}
            className="flex items-center justify-center gap-2 rounded-xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-primary-600/40 disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        </form>
      </div>
    </>
  );
}
