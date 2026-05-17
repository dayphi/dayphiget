import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { cn, formatRupiah } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { RupiahInput } from '@/components/ui/RupiahInput';
import { toast } from 'sonner';
import type { TransactionType } from '@/types';

interface Props {
  onClose: () => void;
}

const HUTANG_PREFIX = 'hutang::';

export function AddTransactionSheet({ onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const { categories, paymentMethods, addTransaction, fetchCategories, fetchPaymentMethods, hutangList, payHutang, budgetItems, transactions, summary } = useBudgetStore();

  useEffect(() => {
    if (user && categories.length === 0) fetchCategories(user.id);
    if (user && paymentMethods.length === 0) fetchPaymentMethods(user.id);
  }, [user]);

  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const now = new Date();
  const [date, setDate] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'tabungan' : true
  );

  const activeHutang = hutangList.filter((h) => Number(h.remaining) > 0);

  // Detect if selected value is a hutang
  const isHutangSelected = categoryId.startsWith(HUTANG_PREFIX);
  const selectedHutangId = isHutangSelected ? categoryId.slice(HUTANG_PREFIX.length) : null;
  const selectedHutang = selectedHutangId ? activeHutang.find((h) => h.id === selectedHutangId) : null;

  // Per-category budget info (only for regular categories)
  const selectedBudget = !isHutangSelected && categoryId ? budgetItems.find((bi) => bi.category_id === categoryId) : null;
  const categorySpent = !isHutangSelected && categoryId
    ? transactions.filter((t) => t.type === 'expense' && t.category_id === categoryId).reduce((s, t) => s + Number(t.amount), 0)
    : 0;
  const categoryRemaining = selectedBudget ? Number(selectedBudget.planned_amount) - categorySpent : null;
  const categoryDailyLimit = categoryRemaining !== null && summary ? Math.max(categoryRemaining / summary.daysRemaining, 0) : null;

  const handleCategoryChange = (val: string) => {
    setCategoryId(val);
    if (val.startsWith(HUTANG_PREFIX)) {
      const h = activeHutang.find((x) => x.id === val.slice(HUTANG_PREFIX.length));
      if (h) {
        const monthly = Number(h.monthly_payment);
        const rem = Number(h.remaining);
        setAmount(monthly > 0 ? String(Math.min(monthly, rem)) : '');
        setNotes(`Bayar cicilan: ${h.name}`);
      }
    } else {
      setNotes('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !categoryId || (paymentMethods.length > 0 && !paymentMethodId)) return;

    setLoading(true);
    try {
      if (isHutangSelected && selectedHutangId) {
        await payHutang(selectedHutangId, user.id, parseFloat(amount), paymentMethodId || undefined);
        toast.success('Cicilan hutang dibayar! ✅');
      } else {
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
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan');
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
            onClick={() => { setType(t); setCategoryId(''); setAmount(''); setPaymentMethodId(''); setNotes(''); }}
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

      {/* Category (with hutang integrated) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Kategori *</label>
        {filteredCategories.length === 0 && activeHutang.length === 0 ? (
          <p className="text-xs text-surface-500 py-4 text-center">Belum ada kategori. Tambahkan di Settings → Kategori.</p>
        ) : (
          <select
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            required
            className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Pilih kategori...</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon || '📦'} {cat.name}
              </option>
            ))}
            {type === 'expense' && activeHutang.length > 0 && (
              <optgroup label="─── 💳 Bayar Hutang ───">
                {activeHutang.map((h) => {
                  const monthly = Number(h.monthly_payment);
                  const rem = Number(h.remaining);
                  return (
                    <option key={h.id} value={`${HUTANG_PREFIX}${h.id}`}>
                      💳 {h.name} {monthly > 0 ? `(${formatRupiah(monthly)}/bln)` : ''} — sisa {formatRupiah(rem)}
                    </option>
                  );
                })}
              </optgroup>
            )}
          </select>
        )}
        {/* Hutang info card */}
        {selectedHutang && (() => {
          const rem = Number(selectedHutang.remaining);
          const pay = parseFloat(amount) || 0;
          const afterPay = Math.max(rem - pay, 0);
          const monthly = Number(selectedHutang.monthly_payment);
          return (
            <div className="rounded-lg bg-surface-800/50 px-3 py-2 text-xs">
              <div className="flex justify-between text-surface-400">
                <span>Sisa hutang</span>
                <span className="font-medium text-surface-200">{formatRupiah(rem)}</span>
              </div>
              {monthly > 0 && (
                <div className="flex justify-between text-surface-400 mt-1">
                  <span>Cicilan/bulan</span>
                  <span className="font-medium text-surface-200">{formatRupiah(monthly)}</span>
                </div>
              )}
              {pay > 0 && (
                <div className="flex justify-between text-surface-400 mt-1 pt-1 border-t border-surface-700/50">
                  <span>Setelah bayar</span>
                  <span className={cn('font-semibold', afterPay <= 0 ? 'text-success-400' : 'text-warning-400')}>
                    {afterPay <= 0 ? '🎉 Lunas!' : formatRupiah(afterPay)}
                  </span>
                </div>
              )}
              {monthly <= 0 && pay <= 0 && (
                <p className="mt-1 text-surface-500">Hutang fleksibel — isi jumlah bebas di bawah</p>
              )}
            </div>
          );
        })()}
        {/* Per-category budget info */}
        {!isHutangSelected && categoryId && type === 'expense' && categoryRemaining !== null && (
          <div className="rounded-lg bg-surface-800/50 px-3 py-2 text-xs">
            <div className="flex justify-between text-surface-400">
              <span>Budget tersisa</span>
              <span className={cn('font-medium', categoryRemaining < 0 ? 'text-danger-400' : 'text-surface-200')}>
                {formatRupiah(categoryRemaining)}
              </span>
            </div>
            {categoryDailyLimit !== null && summary && (
              <div className="flex justify-between text-surface-400 mt-1">
                <span>Limit harian kategori</span>
                <span className="font-medium text-surface-300">
                  {formatRupiah(categoryDailyLimit)}/hari × {summary.daysRemaining} hari
                </span>
              </div>
            )}
          </div>
        )}
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
            {type === 'income' ? 'Masuk ke Wallet *' : 'Bayar dari Wallet *'}
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
        disabled={loading || !amount || !categoryId || (paymentMethods.length > 0 && !paymentMethodId)}
        className="flex items-center justify-center gap-2 rounded-xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-primary-600/40 disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : isHutangSelected ? (
          '💳 Bayar Hutang'
        ) : (
          `Simpan ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`
        )}
      </button>
    </form>
  );
}
