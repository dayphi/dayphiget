import type { OnboardingData } from './OnboardingWizard';
import { Bell } from 'lucide-react';

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepAlerts({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-600/20 shadow-lg">
          <Bell className="h-8 w-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-surface-100">Pengaturan Alert 🔔</h2>
        <p className="mt-1 text-sm text-surface-400">
          Kapan kamu mau dapat peringatan?
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Warning threshold */}
        <div className="glass-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-200">🟡 Warning Sisa Budget</p>
              <p className="text-xs text-surface-500">
                Peringatan saat sisa budget kurang dari X% income
              </p>
            </div>
            <span className="text-lg font-bold text-warning-400 tabular-nums">
              {data.warningPct}%
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={data.warningPct}
            onChange={(e) => onChange({ warningPct: parseInt(e.target.value) })}
            className="w-full accent-warning-500 cursor-pointer"
          />
          <div className="mt-1 flex justify-between text-xs text-surface-600">
            <span>5%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Hutang ratio */}
        <div className="glass-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-200">💳 Hutang Ratio</p>
              <p className="text-xs text-surface-500">
                Peringatan saat total hutang melebihi X% income
              </p>
            </div>
            <span className="text-lg font-bold text-danger-400 tabular-nums">
              {data.hutangPct}%
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={data.hutangPct}
            onChange={(e) => onChange({ hutangPct: parseInt(e.target.value) })}
            className="w-full accent-danger-500 cursor-pointer"
          />
          <div className="mt-1 flex justify-between text-xs text-surface-600">
            <span>10%</span>
            <span>60%</span>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 px-4 py-3">
          <p className="text-sm text-primary-300">
            ✨ Kamu bisa ubah pengaturan ini kapan saja di halaman Settings.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-surface-200">📋 Ringkasan Setup</h3>
        <div className="flex flex-col gap-2 text-xs text-surface-400">
          <p>• Nama: <span className="text-surface-200">{data.displayName || '-'}</span></p>
          <p>• Mata Uang: <span className="text-surface-200">{data.currency}</span></p>
          <p>• Sumber Pendapatan: <span className="text-surface-200">{data.incomeSources.filter(s => s.name).length} sumber</span></p>
          <p>• Kategori: <span className="text-surface-200">{data.selectedCategories.length} dipilih</span></p>
          <p>• Hutang: <span className="text-surface-200">{data.hutangItems.length} item</span></p>
        </div>
      </div>
    </div>
  );
}
