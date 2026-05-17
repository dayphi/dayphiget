import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ICON_OPTIONS = [
  '💵', '💳', '🏦', '📱', '💰', '🪙',
  '🏧', '💎', '🔄', '🛒', '🎫', '📲',
  '🏪', '💸', '🤑', '🪪', '📡', '⚡',
];

interface Props {
  onClose: () => void;
}

export function ManagePaymentMethodsSheet(_props: Props) {
  const user = useAuthStore((s) => s.user);
  const { paymentMethods, addPaymentMethod, deletePaymentMethod } = useBudgetStore();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💳');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!user || !name.trim()) return;
    setAdding(true);
    try {
      await addPaymentMethod({ user_id: user.id, name: name.trim(), icon });
      setName('');
      toast.success('Metode pembayaran ditambahkan');
    } catch {
      toast.error('Gagal menambahkan');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus metode ini?')) return;
    try {
      await deletePaymentMethod(id);
      toast.success('Metode dihapus');
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="flex flex-col gap-4 px-5 pb-8 pt-2">
      {/* Icon picker */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-surface-400">Pilih Icon</label>
        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                icon === ic
                  ? 'bg-primary-500/20 ring-2 ring-primary-500 scale-110'
                  : 'bg-surface-800/50 hover:bg-surface-700/50'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Add form */}
      <div className="flex gap-2">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-surface-700 bg-surface-800/50 text-lg">
          {icon}
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama metode baru"
          className="flex-1 rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !name.trim()}
          className="flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        </button>
      </div>

      {/* List */}
      <div className="glass-card divide-y divide-surface-800/50">
        {paymentMethods.map((pm) => (
          <div key={pm.id} className="flex items-center gap-3 px-4 py-3">
            <span className="text-lg">{pm.icon || '💳'}</span>
            <span className="flex-1 text-sm text-surface-200">{pm.name}</span>
            <button
              onClick={() => handleDelete(pm.id)}
              className="rounded-lg p-1.5 text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {paymentMethods.length === 0 && (
          <p className="text-center text-sm text-surface-500 py-6">Belum ada metode</p>
        )}
      </div>
    </div>
  );
}
