import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { Loader2 } from 'lucide-react';
import { RupiahInput } from '@/components/ui/RupiahInput';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export function AddHutangSheet({ onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const { addHutang, hutangList } = useBudgetStore();

  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [tenor, setTenor] = useState('');
  const [monthly, setMonthly] = useState('');
  const [interest, setInterest] = useState('0');
  const [dueDay, setDueDay] = useState('10');
  const [loading, setLoading] = useState(false);

  const handleTotalChange = (val: string) => {
    setTotal(val);
    if (val && tenor) setMonthly(String(Math.round(parseFloat(val) / parseInt(tenor))));
  };

  const handleTenorChange = (val: string) => {
    setTenor(val);
    if (total && val) setMonthly(String(Math.round(parseFloat(total) / parseInt(val))));
  };

  const handleMonthlyChange = (val: string) => {
    setMonthly(val);
    if (total && val) setTenor(String(Math.ceil(parseFloat(total) / parseFloat(val))));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !total) return;

    setLoading(true);
    try {
      await addHutang({
        user_id: user.id,
        name,
        total_amount: parseFloat(total),
        remaining: parseFloat(total),
        monthly_payment: parseFloat(monthly) || 0,
        interest_rate: parseFloat(interest) || 0,
        due_day: parseInt(dueDay) || 10,
        priority: hutangList.length + 1,
        is_active: true,
      });
      toast.success('Hutang berhasil ditambahkan');
      onClose();
    } catch {
      toast.error('Gagal menambahkan hutang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pb-8 pt-2">
      {/* Nama */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Nama Hutang *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="cth: KPR, Pinjol, Kartu Kredit"
          required
          className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Total */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Total Hutang *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">Rp</span>
          <RupiahInput
            value={total}
            onChange={handleTotalChange}
            placeholder="0"
            required
            className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-3 pl-12 pr-4 text-sm font-bold tabular-nums text-surface-100 placeholder:text-surface-600 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Tenor */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Tenor (bulan)</label>
        <input
          type="number"
          value={tenor}
          onChange={(e) => handleTenorChange(e.target.value)}
          placeholder="cth: 12, 24, 36"
          min={1}
          className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
        {tenor && total && (
          <p className="text-xs text-surface-500">≈ {tenor} bulan × {monthly ? `Rp ${Number(monthly).toLocaleString('id-ID')}` : '...'}/bulan</p>
        )}
      </div>

      {/* Cicilan per bulan */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-surface-300">Cicilan / Bulan</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">Rp</span>
          <RupiahInput
            value={monthly}
            onChange={handleMonthlyChange}
            placeholder="Kosongkan jika belum tahu"
            className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-3 pl-12 pr-4 text-sm font-bold tabular-nums text-surface-100 placeholder:text-surface-600 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Interest + Due Day row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-surface-300">Bunga (%)</label>
          <input
            type="number"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="0"
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

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !name || !total}
        className="flex items-center justify-center gap-2 rounded-xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-primary-600/40 disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          'Simpan Hutang'
        )}
      </button>
    </form>
  );
}
