import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { formatRupiah, calcPercent, cn } from '@/lib/utils';
import { Loader2, Plus } from 'lucide-react';

export function HutangPage() {
  const user = useAuthStore((s) => s.user);
  const { hutangList, isLoading, fetchAll } = useBudgetStore();

  useEffect(() => {
    if (user) fetchAll(user.id);
  }, [user, fetchAll]);

  const totalDebt = hutangList.reduce((s, h) => s + Number(h.remaining), 0);
  const totalMonthly = hutangList.reduce((s, h) => s + Number(h.monthly_payment), 0);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-surface-100">Hutang & Cicilan</h2>
          <p className="text-xs text-surface-500">Kelola dan tracking hutangmu</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-primary-600/25">
          <Plus size={14} /> Tambah
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="text-xs text-surface-400">Total Hutang</p>
          <p className="text-lg font-bold text-danger-400 tabular-nums">{formatRupiah(totalDebt)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-surface-400">Cicilan/Bulan</p>
          <p className="text-lg font-bold text-warning-400 tabular-nums">{formatRupiah(totalMonthly)}</p>
        </div>
      </div>

      {/* Hutang list */}
      {hutangList.length === 0 ? (
        <div className="glass-card py-12 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-sm text-surface-400">Tidak ada hutang! Keren!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {hutangList.map((h) => {
            const paid = Number(h.total_amount) - Number(h.remaining);
            const pct = calcPercent(paid, Number(h.total_amount));
            return (
              <div key={h.id} className="glass-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-surface-200">💳 {h.name}</h3>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium',
                    h.priority === 1 ? 'bg-danger-500/20 text-danger-400' :
                    h.priority === 2 ? 'bg-warning-500/20 text-warning-400' :
                    'bg-surface-700/50 text-surface-400'
                  )}>P{h.priority}</span>
                </div>
                <div className="mb-2 grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-surface-500">Sisa</span><p className="font-medium text-surface-200 tabular-nums">{formatRupiah(Number(h.remaining))}</p></div>
                  <div><span className="text-surface-500">Cicilan</span><p className="font-medium text-surface-200 tabular-nums">{formatRupiah(Number(h.monthly_payment))}</p></div>
                  <div><span className="text-surface-500">Bunga</span><p className="font-medium text-surface-200">{h.interest_rate}%</p></div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-800">
                  <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-surface-500">
                  <span>{pct}% lunas</span>
                  {h.due_day && <span>Jatuh tempo: tgl {h.due_day}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
