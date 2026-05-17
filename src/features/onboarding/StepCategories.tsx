import { useState } from 'react';
import type { OnboardingCategory, OnboardingData } from './OnboardingWizard';
import {
  CATEGORY_ICON_OPTIONS,
  CATEGORY_TYPE_COLORS,
  CATEGORY_TYPE_LABELS,
  DEFAULT_CATEGORIES,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Check, FolderOpen, Plus, X } from 'lucide-react';
import type { CategoryType } from '@/types';

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function StepCategories({ data, onChange }: Props) {
  const categoryTypes = Object.keys(CATEGORY_TYPE_LABELS) as CategoryType[];
  const getDefaultIcon = (categoryType: CategoryType) =>
    DEFAULT_CATEGORIES.find((cat) => cat.type === categoryType)?.icon ?? CATEGORY_ICON_OPTIONS[0];

  const [activeType, setActiveType] = useState<CategoryType>('pokok');
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState(getDefaultIcon('pokok'));
  const [showIconPicker, setShowIconPicker] = useState(false);

  const templates = DEFAULT_CATEGORIES.filter((cat) => cat.type === activeType);
  const selectedNames = new Set(data.selectedCategories.map((cat) => cat.name.toLowerCase()));
  const templateNames = new Set(DEFAULT_CATEGORIES.map((cat) => cat.name.toLowerCase()));
  const normalizedCustomName = customName.trim().toLowerCase();
  const customNameError = normalizedCustomName
    ? selectedNames.has(normalizedCustomName)
      ? 'Kategori sudah dipilih'
      : templateNames.has(normalizedCustomName)
        ? 'Sudah tersedia di template'
        : ''
    : '';
  const allActiveTemplatesSelected = templates.every((cat) =>
    selectedNames.has(cat.name.toLowerCase())
  );

  const setType = (categoryType: CategoryType) => {
    setActiveType(categoryType);
    setCustomIcon(getDefaultIcon(categoryType));
    setShowIconPicker(false);
  };

  const toggleCategory = (category: OnboardingCategory) => {
    const normalizedName = category.name.toLowerCase();
    const selected = selectedNames.has(normalizedName)
      ? data.selectedCategories.filter((cat) => cat.name.toLowerCase() !== normalizedName)
      : [...data.selectedCategories, category];

    onChange({ selectedCategories: selected });
  };

  const selectAllTemplates = () => {
    const selected = [...data.selectedCategories];

    templates.forEach((template) => {
      if (!selected.some((cat) => cat.name.toLowerCase() === template.name.toLowerCase())) {
        selected.push(template);
      }
    });

    onChange({ selectedCategories: selected });
  };

  const addManualCategory = () => {
    if (!customName.trim() || customNameError) return;

    onChange({
      selectedCategories: [
        ...data.selectedCategories,
        {
          name: customName.trim(),
          type: activeType,
          icon: customIcon.trim() || getDefaultIcon(activeType),
          color: CATEGORY_TYPE_COLORS[activeType],
        },
      ],
    });
    setCustomName('');
  };

  const removeCategory = (name: string) => {
    onChange({
      selectedCategories: data.selectedCategories.filter(
        (cat) => cat.name.toLowerCase() !== name.toLowerCase()
      ),
    });
  };

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

      <div className="flex gap-1.5 rounded-xl bg-surface-800/50 p-1">
        {categoryTypes.map((categoryType) => (
          <button
            key={categoryType}
            type="button"
            onClick={() => setType(categoryType)}
            className={cn(
              'flex-1 rounded-lg py-2 text-xs font-medium transition-all',
              activeType === categoryType
                ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                : 'text-surface-400 hover:text-surface-300'
            )}
          >
            {CATEGORY_TYPE_LABELS[categoryType]}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
          Template {CATEGORY_TYPE_LABELS[activeType]}
        </p>
        <button
          type="button"
          onClick={selectAllTemplates}
          disabled={allActiveTemplatesSelected}
          className="text-xs font-medium text-primary-400 transition-colors hover:text-primary-300 disabled:text-surface-600"
        >
          Pilih semua
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {templates.map((cat) => {
          const isSelected = selectedNames.has(cat.name.toLowerCase());
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => toggleCategory(cat)}
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

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
          Tambah manual
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customIcon}
            onChange={(event) => setCustomIcon(event.target.value)}
            onClick={() => setShowIconPicker((open) => !open)}
            onFocus={() => setShowIconPicker(true)}
            className="w-11 shrink-0 rounded-xl border border-surface-700/50 bg-surface-800/30 px-1 py-2.5 text-center text-lg outline-none transition-colors focus:border-primary-500"
            aria-label="Pilih icon kategori"
          />
          <input
            type="text"
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addManualCategory();
            }}
            placeholder={`Nama kategori ${CATEGORY_TYPE_LABELS[activeType].toLowerCase()}...`}
            className="min-w-0 flex-1 rounded-xl border border-surface-700/50 bg-surface-800/30 px-3 py-2.5 text-sm text-surface-100 outline-none transition-colors placeholder:text-surface-500 focus:border-primary-500"
          />
          <button
            type="button"
            onClick={addManualCategory}
            disabled={!customName.trim() || Boolean(customNameError)}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl gradient-primary text-white transition-opacity disabled:opacity-40"
            aria-label="Tambah kategori manual"
          >
            <Plus size={16} />
          </button>
        </div>
        {showIconPicker && (
          <div className="grid grid-cols-8 gap-1.5 rounded-xl border border-surface-700/50 bg-surface-900/80 p-2">
            {CATEGORY_ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setCustomIcon(icon);
                  setShowIconPicker(false);
                }}
                className={cn(
                  'flex h-9 w-full items-center justify-center rounded-lg text-lg transition-all',
                  customIcon === icon
                    ? 'bg-primary-500/20 ring-2 ring-primary-500 scale-105'
                    : 'bg-surface-800/50 hover:bg-surface-700/50'
                )}
                aria-label={`Pilih icon ${icon}`}
              >
                {icon}
              </button>
            ))}
          </div>
        )}
        {customNameError && (
          <p className="text-xs text-warning-400">{customNameError}</p>
        )}
      </div>

      {data.selectedCategories.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            Dipilih
          </p>
          <div className="flex flex-wrap gap-2">
            {data.selectedCategories.map((cat) => (
              <button
                key={`${cat.type}-${cat.name}`}
                type="button"
                onClick={() => removeCategory(cat.name)}
                className="flex items-center gap-1.5 rounded-xl border border-surface-700/50 bg-surface-800/30 px-3 py-2 text-xs text-surface-300 transition-colors hover:border-danger-500/50 hover:text-danger-300"
              >
                <span>{cat.icon}</span>
                {cat.name}
                <X size={12} />
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-surface-500">
        Terpilih: {data.selectedCategories.length} kategori
      </p>
    </div>
  );
}
