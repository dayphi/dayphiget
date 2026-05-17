import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { DEFAULT_CATEGORIES, DEFAULT_PAYMENT_METHODS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { StepProfile } from './StepProfile';
import { StepIncome } from './StepIncome';
import { StepCategories } from './StepCategories';
import { StepHutang } from './StepHutang';
import { StepAlerts } from './StepAlerts';
import { Check, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 'profile', label: 'Profil', icon: '👤' },
  { id: 'income', label: 'Pendapatan', icon: '💰' },
  { id: 'categories', label: 'Kategori', icon: '📂' },
  { id: 'hutang', label: 'Hutang', icon: '💳' },
  { id: 'alerts', label: 'Alert', icon: '🔔' },
] as const;

export type OnboardingData = {
  displayName: string;
  currency: string;
  incomeSources: { name: string; amount: string; payDay: string }[];
  selectedCategories: string[];
  categoryBudgets: Record<string, string>;
  hutangItems: { name: string; total: string; monthly: string; interest: string; dueDay: string }[];
  warningPct: number;
  hutangPct: number;
};

const defaultData: OnboardingData = {
  displayName: '',
  currency: 'IDR',
  incomeSources: [{ name: 'Gaji Utama', amount: '', payDay: '25' }],
  selectedCategories: [],
  categoryBudgets: {},
  hutangItems: [],
  warningPct: 15,
  hutangPct: 30,
};

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [saving, setSaving] = useState(false);
  const { user, updateProfile } = useAuthStore();

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // 1. Seed income sources
      const validIncomes = data.incomeSources.filter((s) => s.name && s.amount);
      if (validIncomes.length > 0) {
        await supabase.from('income_sources').insert(
          validIncomes.map((s) => ({
            user_id: user.id,
            name: s.name,
            amount: parseFloat(s.amount),
            pay_day: parseInt(s.payDay) || 25,
            is_recurring: true,
          }))
        );
      }

      // 2. Seed categories
      const selectedCats = DEFAULT_CATEGORIES.filter((c) =>
        data.selectedCategories.includes(c.name)
      );
      if (selectedCats.length > 0) {
        await supabase.from('categories').insert(
          selectedCats.map((c, i) => ({
            user_id: user.id,
            name: c.name,
            type: c.type,
            icon: c.icon,
            color: c.color,
            sort_order: i,
          }))
        );
      }

      // 3. Seed payment methods
      await supabase.from('payment_methods').insert(
        DEFAULT_PAYMENT_METHODS.map((pm) => ({
          user_id: user.id,
          name: pm.name,
          icon: pm.icon,
        }))
      );

      // 4. Seed hutang
      const validHutang = data.hutangItems.filter((h) => h.name && h.total && h.monthly);
      if (validHutang.length > 0) {
        await supabase.from('hutang').insert(
          validHutang.map((h, i) => ({
            user_id: user.id,
            name: h.name,
            total_amount: parseFloat(h.total),
            remaining: parseFloat(h.total),
            monthly_payment: parseFloat(h.monthly),
            interest_rate: parseFloat(h.interest) || 0,
            due_day: parseInt(h.dueDay) || 10,
            priority: i + 1,
            is_active: true,
          }))
        );
      }

      // 5. Update profile
      await updateProfile({
        display_name: data.displayName || 'User',
        currency: data.currency,
        alert_warning_pct: data.warningPct,
        alert_hutang_pct: data.hutangPct,
        onboarding_completed: true,
      });

      // Reload to go to dashboard
      window.location.href = '/';
    } catch (err) {
      console.error('Onboarding error:', err);
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepProfile data={data} onChange={updateData} />;
      case 1:
        return <StepIncome data={data} onChange={updateData} />;
      case 2:
        return <StepCategories data={data} onChange={updateData} />;
      case 3:
        return <StepHutang data={data} onChange={updateData} />;
      case 4:
        return <StepAlerts data={data} onChange={updateData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-surface-950 gradient-mesh">
      {/* Progress Steps */}
      <div className="sticky top-0 z-10 glass px-4 py-3">
        <div className="mx-auto flex max-w-sm items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  i < step
                    ? 'gradient-primary text-white shadow-lg shadow-primary-600/30'
                    : i === step
                    ? 'border-2 border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border border-surface-700 bg-surface-800/50 text-surface-500'
                )}
              >
                {i < step ? <Check size={14} /> : s.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-1 h-0.5 w-6 rounded-full transition-all duration-500',
                    i < step ? 'bg-primary-500' : 'bg-surface-700'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-surface-400">
          Step {step + 1}/{STEPS.length} — {STEPS[step].label}
        </p>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-md animate-fade-in" key={step}>
          {renderStep()}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 glass px-4 py-4 safe-bottom">
        <div className="mx-auto flex max-w-md gap-3">
          {step > 0 && (
            <button
              onClick={prev}
              className="flex-1 rounded-xl border border-surface-600 py-3 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
            >
              Kembali
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              className="flex-1 rounded-xl gradient-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-primary-600/40"
            >
              Lanjut
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl gradient-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-primary-600/40 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                '🚀 Mulai Pakai!'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
