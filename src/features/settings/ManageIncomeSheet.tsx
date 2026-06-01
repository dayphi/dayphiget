import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { formatRupiah } from '@/lib/utils';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { RupiahInput } from '@/components/ui/RupiahInput';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function ManageIncomeSheet() {
  const user = useAuthStore((s) => s.user);
  const { incomeSources, addIncomeSource, deleteIncomeSource } = useBudgetStore();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [payDay, setPayDay] = useState('25');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!user || !name.trim() || !amount) return;
    setAdding(true);
    try {
      await addIncomeSource({
        user_id: user.id,
        name: name.trim(),
        amount: parseFloat(amount),
        pay_day: parseInt(payDay) || 25,
        is_recurring: true,
      });
      setName('');
      setAmount('');
      toast.success('Sumber pendapatan ditambahkan');
    } catch {
      toast.error('Gagal menambahkan');
    } finally {
      setAdding(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteIncomeSource(deletingId);
      toast.success('Sumber pendapatan dihapus');
    } catch {
      toast.error('Gagal menghapus');
    }
    setDeletingId(null);
  };

  const total = incomeSources.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="flex flex-col gap-4 px-5 pb-8 pt-2">
      {/* Total */}
      {incomeSources.length > 0 && (
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-surface-400">Total Pendapatan</p>
          <p className="text-lg font-bold text-success-400 tabular-nums">{formatRupiah(total)}</p>
        </div>
      )}

      {/* Add form */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama sumber (cth: Gaji, Freelance)"
          className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500"
        />
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-surface-500">Rp</span>
            <RupiahInput
              value={amount}
              onChange={setAmount}
              placeholder="0"
              className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-2.5 pl-10 pr-4 text-sm tabular-nums text-surface-100 placeholder:text-surface-600 outline-none focus:border-primary-500"
            />
          </div>
          <input
            type="number"
            value={payDay}
            onChange={(e) => setPayDay(e.target.value)}
            min={1}
            max={31}
            placeholder="Tgl"
            className="w-20 rounded-xl border border-surface-700 bg-surface-800/50 px-3 py-2.5 text-center text-sm text-surface-100 outline-none focus:border-primary-500"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !name.trim() || !amount}
            className="flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="glass-card divide-y divide-surface-800/50">
        {incomeSources.map((src) => (
          <div key={src.id} className="flex items-center gap-3 px-4 py-3">
            <span className="text-lg">💰</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">{src.name}</p>
              <p className="text-xs text-surface-500">Tgl {src.pay_day} · {formatRupiah(Number(src.amount))}</p>
            </div>
            <button
              onClick={() => setDeletingId(src.id)}
              className="rounded-lg p-1.5 text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {incomeSources.length === 0 && (
          <p className="text-center text-sm text-surface-500 py-6">Belum ada sumber pendapatan</p>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Hapus Sumber Pendapatan"
        description="Apakah Anda yakin ingin menghapus sumber pendapatan ini?"
        confirmText="Hapus Sumber Pendapatan"
      />
    </div>
  );
}
