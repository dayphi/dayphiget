import type { OnboardingData } from './OnboardingWizard';
import { User } from 'lucide-react';

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepProfile({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary-600/20">
          <User className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-surface-100">Selamat Datang! 👋</h2>
        <p className="mt-1 text-sm text-surface-400">
          Yuk, kenalan dulu. Siapa namamu?
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="onboard-name" className="text-sm font-medium text-surface-300">
            Nama Panggilan
          </label>
          <input
            id="onboard-name"
            type="text"
            value={data.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder="e.g., Budi"
            className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-surface-300">Mata Uang</label>
          <div className="flex gap-2">
            {['IDR', 'USD', 'SGD', 'MYR'].map((currency) => (
              <button
                key={currency}
                type="button"
                onClick={() => onChange({ currency })}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                  data.currency === currency
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-surface-700/50 text-surface-400 hover:border-surface-600'
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
