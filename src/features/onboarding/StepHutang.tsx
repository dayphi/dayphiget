import type { OnboardingData } from './OnboardingWizard';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { RupiahInput } from '@/components/ui/RupiahInput';

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepHutang({ data, onChange }: Props) {
  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...data.hutangItems];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ hutangItems: updated });
  };

  const addItem = () => {
    onChange({
      hutangItems: [
        ...data.hutangItems,
        { name: '', total: '', monthly: '', interest: '0', dueDay: '10' },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({
      hutangItems: data.hutangItems.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600/20 shadow-lg">
          <CreditCard className="h-8 w-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-surface-100">Hutang & Cicilan 💳</h2>
        <p className="mt-1 text-sm text-surface-400">
          Punya hutang? Tambahkan di sini. Bisa dilewati.
        </p>
      </div>

      {data.hutangItems.length === 0 ? (
        <div className="glass-card py-8 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-sm text-surface-400 mb-4">Belum ada hutang? Keren!</p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-surface-600 px-4 py-2 text-sm text-surface-400 transition-colors hover:border-primary-500 hover:text-primary-400"
          >
            <Plus size={14} /> Saya punya hutang
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {data.hutangItems.map((item, i) => (
              <div key={i} className="glass-card p-4 animate-scale-in">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-surface-400">
                    Hutang #{i + 1}
                  </span>
                  <button
                    onClick={() => removeItem(i)}
                    className="rounded-lg p-1 text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(i, 'name', e.target.value)}
                    placeholder="Nama hutang (e.g., CC Bank X)"
                    className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">Rp</span>
                      <RupiahInput
                        value={item.total}
                        onChange={(val) => updateItem(i, 'total', val)}
                        placeholder="Total hutang"
                        className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-2.5 pl-10 pr-3 text-sm tabular-nums text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">Rp</span>
                      <RupiahInput
                        value={item.monthly}
                        onChange={(val) => updateItem(i, 'monthly', val)}
                        placeholder="Cicilan/bln"
                        className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-2.5 pl-10 pr-3 text-sm tabular-nums text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">%</span>
                      <input
                        type="number"
                        value={item.interest}
                        onChange={(e) => updateItem(i, 'interest', e.target.value)}
                        placeholder="Bunga"
                        className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-2.5 pl-10 pr-3 text-sm tabular-nums text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">Tgl</span>
                      <input
                        type="number"
                        value={item.dueDay}
                        onChange={(e) => updateItem(i, 'dueDay', e.target.value)}
                        placeholder="Jatuh tempo"
                        min={1}
                        max={31}
                        className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-2.5 pl-10 pr-3 text-sm tabular-nums text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-surface-600 py-3 text-sm text-surface-400 transition-colors hover:border-primary-500 hover:text-primary-400"
          >
            <Plus size={16} /> Tambah Hutang Lain
          </button>
        </>
      )}
    </div>
  );
}
