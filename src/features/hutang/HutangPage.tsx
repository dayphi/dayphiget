import { useState } from 'react';

import { useBudgetStore } from '@/stores/budgetStore';
import { formatRupiah, calcPercent, cn } from '@/lib/utils';
import { Loader2, Plus, Pencil } from 'lucide-react';
import { AddHutangSheet } from './AddHutangSheet';
import { EditHutangSheet } from './EditHutangSheet';
import { BottomSheet } from '@/components/ui/BottomSheet';
import type { Hutang } from '@/types';

export function HutangPage() {
  const { hutangList, isLoading } = useBudgetStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Hutang | null>(null);

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
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-xl gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-primary-600/25">
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
            const remaining = Number(h.remaining);
            const total = Number(h.total_amount);
            const monthly = Number(h.monthly_payment);
            const paid = total - remaining;
            const pct = calcPercent(paid, total);
            const isLunas = remaining <= 0;
            return (
              <div key={h.id} className={cn('glass-card p-4', isLunas && 'opacity-70')}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-surface-200">💳 {h.name}</h3>
                    {isLunas && (
                      <span className="rounded-full bg-success-500/20 px-2 py-0.5 text-xs font-semibold text-success-400">✓ Lunas</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditItem(h)}
                      className="rounded-lg p-1.5 text-surface-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium',
                      h.priority === 1 ? 'bg-danger-500/20 text-danger-400' :
                      h.priority === 2 ? 'bg-warning-500/20 text-warning-400' :
                      'bg-surface-700/50 text-surface-400'
                    )}>P{h.priority}</span>
                  </div>
                </div>
                <div className={cn('mb-2 grid gap-2 text-xs', monthly > 0 ? 'grid-cols-4' : 'grid-cols-3')}>
                  <div><span className="text-surface-500">Sisa</span><p className="font-medium text-surface-200 tabular-nums">{formatRupiah(remaining)}</p></div>
                  {monthly > 0 && <div><span className="text-surface-500">Cicilan</span><p className="font-medium text-surface-200 tabular-nums">{formatRupiah(monthly)}</p></div>}
                  <div><span className="text-surface-500">Tenor</span><p className="font-medium text-surface-200">{monthly > 0 && remaining > 0 ? `${Math.ceil(remaining / monthly)} bln` : isLunas ? 'Selesai' : 'Fleksibel'}</p></div>
                  <div><span className="text-surface-500">Bunga</span><p className="font-medium text-surface-200">{h.interest_rate}%</p></div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-800">
                  <div className={cn('h-full rounded-full transition-all duration-500', isLunas ? 'bg-success-500' : 'bg-primary-500')} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-surface-500">
                  <span>{pct}% lunas</span>
                  {h.due_day && <span>Jatuh tempo: tgl {h.due_day}</span>}
                </div>
                {isLunas && (
                  <p className="mt-3 text-center text-xs font-medium text-success-400">🎉 Hutang ini sudah lunas!</p>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Add Hutang Bottom Sheet */}
      <BottomSheet
        title="Tambah Hutang"
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
      >
        <AddHutangSheet onClose={() => setShowAdd(false)} />
      </BottomSheet>

      <BottomSheet
        title="Edit Hutang"
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
      >
        {editItem && <EditHutangSheet hutang={editItem} onClose={() => setEditItem(null)} />}
      </BottomSheet>
    </div>
  );
}
