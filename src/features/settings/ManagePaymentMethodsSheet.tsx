import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { Trash2, Plus, Loader2, X } from 'lucide-react';
import { RupiahInput } from '@/components/ui/RupiahInput';
import { formatRupiah } from '@/lib/utils';
import { toast } from 'sonner';
import { PaymentIcon, getAutoPaymentIcon, BANK_LOGOS } from '@/components/ui/PaymentIcon';

const ICON_OPTIONS = [
  '💵', '💳', '🏦', '📱', '💰', '🪙',
  '🏧', '💎', '🔄', '🛒', '🎫', '📲',
  '🏪', '💸', '🤑', '🪪', '📡', '⚡',
];

export function ManagePaymentMethodsSheet() {
  const user = useAuthStore((s) => s.user);
  const { paymentMethods, addPaymentMethod, deletePaymentMethod } = useBudgetStore();

  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [icon, setIcon] = useState('💳');
  const [adding, setAdding] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);


  // Auto-detect bank/ewallet from name
  useEffect(() => {
    if (name.trim()) {
      const autoIcon = getAutoPaymentIcon(name);
      if (autoIcon) {
        setIcon(autoIcon);
      }
    }
  }, [name]);

  const handleAdd = async () => {
    if (!user || !name.trim()) return;
    setAdding(true);
    try {
      await addPaymentMethod({
        user_id: user.id,
        name: name.trim(),
        icon,
        initial_balance: parseFloat(initialBalance) || 0,
      });
      setName('');
      setInitialBalance('');
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
      {/* Add form */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowIconPicker(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-surface-700 bg-surface-800/50 text-lg hover:bg-surface-700/50 transition-colors focus:outline-none focus:border-primary-500"
          title="Pilih Ikon"
        >
          <PaymentIcon icon={icon} className="w-6 h-6" fallbackClassName="text-lg" />
        </button>
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

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-surface-500">Rp</span>
        <RupiahInput
          value={initialBalance}
          onChange={setInitialBalance}
          placeholder="Saldo awal wallet"
          className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-2.5 pl-10 pr-4 text-sm tabular-nums text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500"
        />
      </div>

      {/* List */}
      <div className="glass-card divide-y divide-surface-800/50">
        {paymentMethods.map((pm) => (
          <div key={pm.id} className="flex items-center gap-3 px-4 py-3">
            <PaymentIcon icon={pm.icon} className="w-7 h-7" fallbackClassName="text-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-surface-200 truncate">{pm.name}</p>
              <p className="text-xs text-surface-500">Saldo awal {formatRupiah(Number(pm.initial_balance || 0))}</p>
            </div>
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

      {/* Icon Picker Pop-up */}
      {showIconPicker && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowIconPicker(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto rounded-t-3xl border-t border-surface-700/50 bg-surface-900 animate-slide-up safe-bottom">
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-surface-600" />
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h2 className="text-lg font-bold text-surface-100">Pilih Ikon</h2>
              <button
                type="button"
                onClick={() => setShowIconPicker(false)}
                className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-5 p-5">
              {/* E-Wallet & Bank Logos */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-surface-400">Bank & E-Wallet</span>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(BANK_LOGOS).map((bankKey) => {
                    const bankIconVal = `bank:${bankKey}`;
                    return (
                      <button
                        key={bankKey}
                        type="button"
                        onClick={() => {
                          setIcon(bankIconVal);
                          setShowIconPicker(false);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          icon === bankIconVal
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-surface-800 bg-surface-800/30 hover:bg-surface-800/60'
                        }`}
                      >
                        <PaymentIcon icon={bankIconVal} className="w-8 h-8 mb-1" />
                        <span className="text-[10px] text-surface-400 capitalize">{bankKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Standard Emojis */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-surface-400">Ikon Standar</span>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => {
                        setIcon(ic);
                        setShowIconPicker(false);
                      }}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl transition-all ${
                        icon === ic
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-surface-800 bg-surface-800/30 hover:bg-surface-800/60'
                      }`}
                    >
                      <PaymentIcon icon={ic} className="w-6 h-6" fallbackClassName="text-xl" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
