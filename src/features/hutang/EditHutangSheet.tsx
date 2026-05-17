import { useState } from 'react';
import { useBudgetStore } from '@/stores/budgetStore';
import { Loader2, Trash2 } from 'lucide-react';
import { RupiahInput } from '@/components/ui/RupiahInput';
import { toast } from 'sonner';
import type { Hutang } from '@/types';

interface Props {
  hutang: Hutang;
  onClose: () => void;
}

export function EditHutangSheet({ hutang, onClose }: Props) {
  const { updateHutang, deleteHutang } = useBudgetStore();

  const [name, setName] = useState(hutang.name);
  const [remaining, setRemaining] = useState(String(hutang.remaining));
  const [monthly, setMonthly] = useState(String(hutang.monthly_payment));
  const [interest, setInterest] = useState(String(hutang.interest_rate));
  const [dueDay, setDueDay] = useState(String(hutang.due_day || 10));
  const [loading, setLoading] = useState(false);

  const tenor = Number(monthly) > 0 ? Math.ceil(Number(remaining) / Number(monthly)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !remaining || !monthly) return;

    setLoading(true);
    try {
      await updateHutang(hutang.id, {
        name,
        remaining: parseFloat(remaining),
        monthly_payment: parseFloat(monthly),
        interest_rate: parseFloat(interest) || 0,
        due_day: parseInt(dueDay) || 10,
      });
      toast.success('Hutang berhasil diupdate');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal update';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Hapus hutang ini? Data tidak bisa dikembalikan.')) return;
    try {
      await deleteHutang(hutang.id);
      toast.success('Hutang dihapus');
      onClose();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pb-8 pt-2">
      {/* Nama */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Nama Hutang</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Sisa Hutang */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Sisa Hutang</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">Rp</span>
          <RupiahInput
            value={remaining}
            onChange={setRemaining}
            required
            className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-3 pl-12 pr-4 text-sm font-bold tabular-nums text-surface-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Cicilan */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Cicilan / Bulan</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">Rp</span>
          <RupiahInput
            value={monthly}
            onChange={setMonthly}
            required
            className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-3 pl-12 pr-4 text-sm font-bold tabular-nums text-surface-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        {tenor > 0 && (
          <p className="text-xs text-surface-500">≈ {tenor} bulan tersisa</p>
        )}
      </div>

      {/* Interest + Due Day */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-surface-300">Bunga (%)</label>
          <input
            type="number"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            min={0}
            step="0.1"
            className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-surface-300">Jatuh Tempo (tgl)</label>
          <input
            type="number"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            min={1}
            max={31}
            className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm font-medium text-danger-400 transition-all hover:bg-danger-500/20"
        >
          <Trash2 size={16} />
          Hapus
        </button>
        <button
          type="submit"
          disabled={loading || !name || !remaining || !monthly}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl gradient-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}
