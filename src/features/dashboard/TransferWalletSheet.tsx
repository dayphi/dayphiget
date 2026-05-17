import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { RupiahInput } from '@/components/ui/RupiahInput';
import { cn, formatRupiah } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export function TransferWalletSheet({ onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const { paymentMethods, walletBalances, addWalletTransfer } = useBudgetStore();
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [date, setDate] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);

  const fromBalance = walletBalances.find((item) => item.wallet.id === fromWalletId)?.balance ?? 0;
  const isInvalid = !fromWalletId || !toWalletId || fromWalletId === toWalletId || !amount;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || isInvalid) return;

    setLoading(true);
    try {
      await addWalletTransfer({
        user_id: user.id,
        from_payment_method_id: fromWalletId,
        to_payment_method_id: toWalletId,
        amount: parseFloat(amount),
        date,
        notes: notes || null,
      });
      toast.success('Transfer wallet tersimpan');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal transfer wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pb-8 pt-2">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <WalletSelect
          label="Dari"
          value={fromWalletId}
          wallets={paymentMethods}
          onChange={setFromWalletId}
        />
        <ArrowRight size={18} className="mt-6 text-surface-500" />
        <WalletSelect
          label="Ke"
          value={toWalletId}
          wallets={paymentMethods}
          onChange={setToWalletId}
        />
      </div>

      {fromWalletId && (
        <p className="rounded-lg bg-surface-800/50 px-3 py-2 text-xs text-surface-400">
          Saldo sumber: <span className={cn('font-semibold', fromBalance < 0 ? 'text-danger-400' : 'text-surface-200')}>{formatRupiah(fromBalance)}</span>
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Jumlah *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">Rp</span>
          <RupiahInput
            value={amount}
            onChange={setAmount}
            placeholder="0"
            className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-3 pl-12 pr-4 text-lg font-bold tabular-nums text-surface-100 placeholder:text-surface-600 outline-none focus:border-primary-500"
          />
        </div>
      </div>

      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 outline-none focus:border-primary-500"
      />

      <input
        type="text"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Catatan transfer (opsional)"
        className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500"
      />

      <button
        type="submit"
        disabled={loading || isInvalid}
        className="flex items-center justify-center gap-2 rounded-xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight size={16} />}
        Transfer Wallet
      </button>
    </form>
  );
}

function WalletSelect({
  label,
  value,
  wallets,
  onChange,
}: {
  label: string;
  value: string;
  wallets: { id: string; name: string; icon: string | null }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-medium text-surface-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 rounded-xl border border-surface-700 bg-surface-800/50 px-3 py-3 text-sm text-surface-100 outline-none focus:border-primary-500"
      >
        <option value="">Pilih</option>
        {wallets.map((wallet) => (
          <option key={wallet.id} value={wallet.id}>
            {wallet.icon || '💳'} {wallet.name}
          </option>
        ))}
      </select>
    </label>
  );
}
