import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { formatRupiah, calcPercent, cn } from '@/lib/utils';
import { CATEGORY_TYPE_LABELS } from '@/lib/constants';
import { Loader2, Pencil, Check, X } from 'lucide-react';
import { RupiahInput } from '@/components/ui/RupiahInput';
import { toast } from 'sonner';
import type { CategoryType } from '@/types';

export function BudgetPage() {
  const user = useAuthStore((s) => s.user);
  const { categories, transactions, budgetItems, isLoading, summary, setBudgetItem } = useBudgetStore();
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const expensesByCat = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category_id] = (acc[tx.category_id] || 0) + Number(tx.amount);
      return acc;
    }, {});

  type BudgetRow = { catId: string; name: string; icon: string; color: string; planned: number; actual: number };
  const typeGroups: Partial<Record<CategoryType, BudgetRow[]>> = {};
  for (const cat of categories) {
    if (!typeGroups[cat.type]) typeGroups[cat.type] = [];
    const bi = budgetItems.find((b) => b.category_id === cat.id);
    typeGroups[cat.type]!.push({
      catId: cat.id, name: cat.name, icon: cat.icon || '📦', color: cat.color,
      planned: bi ? Number(bi.planned_amount) : 0, actual: expensesByCat[cat.id] || 0,
    });
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-surface-100">Budget Breakdown</h2>
        <p className="text-xs text-surface-500">Budget vs aktual bulan ini</p>
      </div>

      {summary && (
        <div className="glass-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-surface-400">Total Budget Used</span>
            <span className="font-bold text-surface-200">{formatRupiah(summary.totalExpense)} / {formatRupiah(summary.totalIncome)}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-800">
            <div className={cn('h-full rounded-full transition-all duration-700',
              summary.totalIncome > 0 && summary.totalExpense / summary.totalIncome > 1 ? 'bg-danger-500' :
              summary.totalIncome > 0 && summary.totalExpense / summary.totalIncome > 0.8 ? 'bg-warning-500' : 'bg-primary-500'
            )} style={{ width: `${Math.min(summary.totalIncome > 0 ? (summary.totalExpense / summary.totalIncome) * 100 : 0, 100)}%` }} />
          </div>
        </div>
      )}

      {(Object.keys(typeGroups) as CategoryType[]).map((type) => {
        const items = typeGroups[type]!;
        const total = items.reduce((s, i) => s + i.actual, 0);
        const planned = items.reduce((s, i) => s + i.planned, 0);
        return (
          <div key={type} className="glass-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-surface-800/50 px-4 py-3">
              <h3 className="text-sm font-semibold text-surface-200">{CATEGORY_TYPE_LABELS[type]}</h3>
              <span className="text-xs text-surface-400">{formatRupiah(total)}{planned > 0 && ` / ${formatRupiah(planned)}`}</span>
            </div>
            <div className="divide-y divide-surface-800/30">
              {items.map((item) => {
                const pct = item.planned > 0 ? calcPercent(item.actual, item.planned) : 0;
                const isEditing = editingCat === item.catId;

                const startEdit = () => {
                  setEditingCat(item.catId);
                  setEditValue(item.planned > 0 ? String(item.planned) : '');
                };

                const cancelEdit = () => {
                  setEditingCat(null);
                  setEditValue('');
                };

                const saveEdit = async () => {
                  if (!user) return;
                  const val = parseFloat(editValue) || 0;
                  setSaving(true);
                  try {
                    await setBudgetItem(user.id, item.catId, val);
                    toast.success(`Budget ${item.name} disimpan`);
                    setEditingCat(null);
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : 'Gagal menyimpan';
                    toast.error(msg);
                  } finally {
                    setSaving(false);
                  }
                };

                return (
                  <div key={item.catId} className="px-4 py-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2"><span>{item.icon}</span><span className="text-sm text-surface-300">{item.name}</span></div>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-surface-500">Rp</span>
                          <RupiahInput
                            value={editValue}
                            onChange={setEditValue}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                            autoFocus
                            className="w-28 rounded-lg border border-primary-500 bg-surface-800/50 px-2 py-1 text-right text-xs tabular-nums text-surface-100 outline-none"
                          />
                          <button onClick={saveEdit} disabled={saving} className="rounded-lg p-1 text-success-400 hover:bg-success-500/10">
                            <Check size={14} />
                          </button>
                          <button onClick={cancelEdit} className="rounded-lg p-1 text-surface-500 hover:bg-surface-700">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs tabular-nums text-surface-400">{formatRupiah(item.actual)}{item.planned > 0 && <span className="text-surface-600"> / {formatRupiah(item.planned)}</span>}</span>
                          <button onClick={startEdit} className="rounded-lg p-1 text-surface-600 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    {item.planned > 0 && !isEditing && (
                      <>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-800">
                          <div className={cn('h-full rounded-full transition-all duration-500', pct >= 100 ? 'bg-danger-500' : pct >= 80 ? 'bg-warning-500' : 'bg-primary-500')} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <div className="mt-1 flex justify-between text-xs">
                          <span className={pct >= 100 ? 'text-danger-400' : pct >= 80 ? 'text-warning-400' : 'text-surface-500'}>{pct}%</span>
                          <span className={cn('tabular-nums', item.planned - item.actual < 0 ? 'text-danger-400' : 'text-surface-500')}>Sisa: {formatRupiah(item.planned - item.actual)}</span>
                        </div>
                      </>
                    )}
                    {item.planned === 0 && !isEditing && (
                      <button onClick={startEdit} className="text-xs text-primary-500 hover:text-primary-400">
                        + Set budget
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {categories.length === 0 && (
        <div className="glass-card py-12 text-center">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm text-surface-400">Belum ada kategori. Tambahkan di Settings.</p>
        </div>
      )}
    </div>
  );
}
