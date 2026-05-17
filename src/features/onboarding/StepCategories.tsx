import type { OnboardingData } from './OnboardingWizard';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { CATEGORY_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Check, FolderOpen } from 'lucide-react';
import type { CategoryType } from '@/types';

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepCategories({ data, onChange }: Props) {
  const toggleCategory = (name: string) => {
    const selected = data.selectedCategories.includes(name)
      ? data.selectedCategories.filter((c) => c !== name)
      : [...data.selectedCategories, name];
    onChange({ selectedCategories: selected });
  };

  const selectAll = () => {
    onChange({
      selectedCategories: DEFAULT_CATEGORIES.map((c) => c.name),
    });
  };

  // Group by type
  const grouped = DEFAULT_CATEGORIES.reduce<
    Partial<Record<CategoryType, typeof DEFAULT_CATEGORIES>>
  >((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = [];
    acc[cat.type]!.push(cat);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/20 shadow-lg">
          <FolderOpen className="h-8 w-8 text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-surface-100">Kategori Budget 📂</h2>
        <p className="mt-1 text-sm text-surface-400">
          Pilih kategori pengeluaran yang kamu pakai
        </p>
      </div>

      <button
        onClick={selectAll}
        className="self-end text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
      >
        Pilih Semua ({DEFAULT_CATEGORIES.length})
      </button>

      {(Object.keys(grouped) as CategoryType[]).map((type) => (
        <div key={type}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
            {CATEGORY_TYPE_LABELS[type]}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {grouped[type]!.map((cat) => {
              const isSelected = data.selectedCategories.includes(cat.name);
              return (
                <button
                  key={cat.name}
                  onClick={() => toggleCategory(cat.name)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-all',
                    isSelected
                      ? 'border-primary-500/50 bg-primary-500/10'
                      : 'border-surface-700/50 bg-surface-800/30 hover:border-surface-600'
                  )}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      isSelected ? 'text-primary-300 font-medium' : 'text-surface-400'
                    )}
                  >
                    {cat.name}
                  </span>
                  {isSelected && (
                    <Check size={14} className="text-primary-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-center text-xs text-surface-500">
        Terpilih: {data.selectedCategories.length} kategori
      </p>
    </div>
  );
}
