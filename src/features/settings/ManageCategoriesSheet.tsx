import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { CATEGORY_ICON_OPTIONS, CATEGORY_TYPE_LABELS, DEFAULT_CATEGORIES } from '@/lib/constants';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { CategoryType } from '@/types';

export function ManageCategoriesSheet() {
  const user = useAuthStore((s) => s.user);
  const { categories, addCategory, deleteCategory } = useBudgetStore();

  const [type, setType] = useState<CategoryType>('pokok');
  const [customName, setCustomName] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [customIcon, setCustomIcon] = useState('📦');
  const [adding, setAdding] = useState<string | null>(null);

  const existingNames = categories.map((c) => c.name.toLowerCase());

  // Templates for the selected type that haven't been added yet
  const templates = DEFAULT_CATEGORIES
    .filter((t) => t.type === type && !existingNames.includes(t.name.toLowerCase()));

  const grouped = categories.reduce<Partial<Record<CategoryType, typeof categories>>>((acc, c) => {
    if (!acc[c.type]) acc[c.type] = [];
    acc[c.type]!.push(c);
    return acc;
  }, {});

  const handleAddTemplate = async (tpl: typeof DEFAULT_CATEGORIES[0]) => {
    if (!user) return;
    setAdding(tpl.name);
    try {
      await addCategory({
        user_id: user.id,
        name: tpl.name,
        type: tpl.type,
        icon: tpl.icon,
        color: tpl.color,
        sort_order: categories.length,
      });
      toast.success(`${tpl.name} ditambahkan`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan');
    } finally {
      setAdding(null);
    }
  };

  const handleAddCustom = async () => {
    if (!user || !customName.trim()) return;
    setAdding('__custom__');
    try {
      await addCategory({
        user_id: user.id,
        name: customName.trim(),
        type,
        icon: customIcon,
        color: '#6366f1',
        sort_order: categories.length,
      });
      setCustomName('');
      toast.success('Kategori ditambahkan');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan');
    } finally {
      setAdding(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await deleteCategory(id);
      toast.success('Kategori dihapus');
    } catch {
      toast.error('Gagal menghapus (mungkin masih dipakai transaksi)');
    }
  };

  return (
    <div className="flex flex-col gap-4 px-5 pb-8 pt-2 max-h-[70dvh] overflow-y-auto">
      {/* Type tabs */}
      <div className="flex gap-1.5 rounded-xl bg-surface-800/50 p-1">
        {(Object.keys(CATEGORY_TYPE_LABELS) as CategoryType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setShowIconPicker(false);
            }}
            className={cn(
              'flex-1 rounded-lg py-2 text-xs font-medium transition-all',
              type === t
                ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                : 'text-surface-400 hover:text-surface-300'
            )}
          >
            {CATEGORY_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Template suggestions */}
      {templates.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-surface-400">Template tersedia</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => handleAddTemplate(tpl)}
                disabled={adding === tpl.name}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-surface-600 bg-surface-800/30 px-3 py-2 text-xs text-surface-300 transition-all hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-400 disabled:opacity-50"
              >
                {adding === tpl.name ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <span className="text-sm">{tpl.icon}</span>
                )}
                {tpl.name}
                <Plus size={12} className="text-surface-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom add */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-surface-400">Atau tambah manual</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customIcon}
            onChange={(e) => setCustomIcon(e.target.value)}
            onClick={() => setShowIconPicker((open) => !open)}
            onFocus={() => setShowIconPicker(true)}
            className="w-11 shrink-0 rounded-xl border border-surface-700 bg-surface-800/50 px-1 py-2.5 text-center text-lg outline-none focus:border-primary-500"
            aria-label="Pilih icon kategori"
          />
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustom(); }}
            placeholder={`Nama kategori ${CATEGORY_TYPE_LABELS[type].toLowerCase()}...`}
            className="flex-1 rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={adding === '__custom__' || !customName.trim()}
            className="flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            {adding === '__custom__' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>
        {showIconPicker && (
          <div className="grid grid-cols-8 gap-1.5 rounded-xl border border-surface-700/50 bg-surface-900/80 p-2">
            {CATEGORY_ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
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
      </div>

      {/* Divider */}
      <div className="border-t border-surface-800/50" />

      {/* Existing categories list */}
      {(Object.keys(grouped) as CategoryType[]).map((t) => (
        <div key={t}>
          <p className="mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wide">
            {CATEGORY_TYPE_LABELS[t]}
          </p>
          <div className="glass-card divide-y divide-surface-800/50">
            {grouped[t]!.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-lg">{cat.icon || '📦'}</span>
                <span className="flex-1 text-sm text-surface-200">{cat.name}</span>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="rounded-lg p-1.5 text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <p className="text-center text-sm text-surface-500 py-6">Belum ada kategori</p>
      )}
    </div>
  );
}
