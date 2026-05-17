import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { cn } from '@/lib/utils';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { TransactionType } from '@/types';

interface Props {
  onClose: () => void;
}

export function AddTransactionSheet({ onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const { categories, paymentMethods, addTransaction } = useBudgetStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'tabungan' || c.type === 'lainnya' : true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !categoryId || !amount) return;

    setLoading(true);
    try {
      await addTransaction({
        user_id: user.id,
        category_id: categoryId,
        payment_method_id: paymentMethodId || null,
        type,
        amount: parseFloat(amount),
        date,
        notes: notes || null,
        tags: null,
        is_recurring: false,
        recurring_freq: null,
      });
      toast.success('Transaksi tersimpan! ✅');
      onClose();
    } catch {
      toast.error('Gagal menyimpan transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pb-8 pt-2">
      {/* Type Toggle */}
      <div className="flex gap-2 rounded-xl bg-surface-800/50 p-1">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
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

      {/* Amount */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Jumlah *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">
            Rp
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            required
            min={1}
            className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-3 pl-12 pr-4 text-lg font-bold tabular-nums text-surface-100 placeholder:text-surface-600 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Kategori *</label>
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition-all',
                categoryId === cat.id
                  ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                  : 'border-surface-700/50 bg-surface-800/30 text-surface-400 hover:border-surface-600'
              )}
            >
              <span className="text-lg">{cat.icon || '📦'}</span>
              <span className="truncate w-full text-center">{cat.name}</span>
              {categoryId === cat.id && (
                <Check size={12} className="text-primary-400" />
              )}
            </button>
          ))}
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

      {/* Payment Method */}
      {type === 'expense' && paymentMethods.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-surface-300">Metode Bayar</label>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() =>
                  setPaymentMethodId(paymentMethodId === pm.id ? '' : pm.id)
                }
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs transition-all',
                  paymentMethodId === pm.id
                    ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                    : 'border-surface-700/50 text-surface-400 hover:border-surface-600'
                )}
              >
                {pm.icon} {pm.name}
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
        disabled={loading || !categoryId || !amount}
        className="flex items-center justify-center gap-2 rounded-xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-primary-600/40 disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          `Simpan ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`
        )}
      </button>
    </form>
  );
}
