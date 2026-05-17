import type { OnboardingData } from './OnboardingWizard';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { RupiahInput } from '@/components/ui/RupiahInput';

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepIncome({ data, onChange }: Props) {
  const updateSource = (index: number, field: string, value: string) => {
    const updated = [...data.incomeSources];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ incomeSources: updated });
  };

  const addSource = () => {
    onChange({
      incomeSources: [
        ...data.incomeSources,
        { name: '', amount: '', payDay: '25' },
      ],
    });
  };

  const removeSource = (index: number) => {
    if (data.incomeSources.length <= 1) return;
    onChange({
      incomeSources: data.incomeSources.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/20 shadow-lg">
          <Wallet className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-surface-100">Sumber Pendapatan 💰</h2>
        <p className="mt-1 text-sm text-surface-400">
          Dari mana saja pemasukanmu setiap bulan?
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {data.incomeSources.map((source, i) => (
          <div
            key={i}
            className="glass-card p-4 animate-scale-in"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-surface-400">
                Sumber #{i + 1}
              </span>
              {data.incomeSources.length > 1 && (
                <button
                  onClick={() => removeSource(i)}
                  className="rounded-lg p-1 text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={source.name}
                onChange={(e) => updateSource(i, 'name', e.target.value)}
                placeholder="Nama sumber (e.g., Gaji Utama)"
                className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">
                    Rp
                  </span>
                  <RupiahInput
                    value={source.amount}
                    onChange={(val) => updateSource(i, 'amount', val)}
                    placeholder="Jumlah"
                    className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-2.5 pl-10 pr-3 text-sm font-medium tabular-nums text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">
                    Tgl
                  </span>
                  <input
                    type="number"
                    value={source.payDay}
                    onChange={(e) => updateSource(i, 'payDay', e.target.value)}
                    placeholder="25"
                    min={1}
                    max={31}
                    className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-2.5 pl-10 pr-3 text-sm tabular-nums text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addSource}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-surface-600 py-3 text-sm text-surface-400 transition-colors hover:border-primary-500 hover:text-primary-400"
        >
          <Plus size={16} />
          Tambah Sumber Pendapatan
        </button>
      </div>
    </div>
  );
}
