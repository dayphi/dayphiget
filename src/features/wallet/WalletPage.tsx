import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { WalletBalances } from '@/features/dashboard/WalletBalances';
import { cn, formatRupiah } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, ArrowRight, Loader2, Pencil, Trash2 } from 'lucide-react';
import { RupiahInput } from '@/components/ui/RupiahInput';
import { toast } from 'sonner';
import type { WalletTransfer } from '@/types';
import { getPaymentIconText } from '@/components/ui/PaymentIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';


export function WalletPage() {
  const { isLoading, walletTransfers, walletBalances, deleteWalletTransfer } = useBudgetStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<WalletTransfer | null>(null);

  const totalBalance = walletBalances.reduce((sum, item) => sum + item.balance, 0);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteWalletTransfer(deletingId);
      setExpandedId(null);
      toast.success('Transfer dihapus');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus transfer');
    }
    setDeletingId(null);
  };

  const handleEdit = (transfer: WalletTransfer) => {
    setExpandedId(null);
    setEditingTransfer(transfer);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      <section className="rounded-2xl border border-primary-500/15 bg-surface-900/70 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-surface-500">Total Saldo</p>
        <p className={cn('mt-1 text-3xl font-bold tabular-nums', totalBalance < 0 ? 'text-danger-400' : 'text-surface-100')}>
          {formatRupiah(totalBalance)}
        </p>
        <p className="mt-2 text-xs text-surface-500">
          Saldo dihitung dari saldo awal, pemasukan, pengeluaran, dan transfer antar wallet bulan ini.
        </p>
      </section>

      <WalletBalances />

      <section className="glass-card overflow-hidden">
        <div className="border-b border-surface-800/50 px-4 py-3">
          <h2 className="text-sm font-semibold text-surface-200">Transfer Terakhir</h2>
        </div>
        {walletTransfers.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-surface-500">Belum ada transfer wallet bulan ini</p>
        ) : (
          <div className="divide-y divide-surface-800/50">
            {walletTransfers.slice(0, 10).map((transfer) => {
              const isExpanded = expandedId === transfer.id;
              return (
                <div key={transfer.id} className="overflow-hidden">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : transfer.id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                      isExpanded ? 'bg-surface-800/30' : 'active:bg-surface-800/20'
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
                      <ArrowUpRight size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-surface-200">
                        {transfer.from_payment_method?.name || 'Wallet'} ke {transfer.to_payment_method?.name || 'Wallet'}
                      </p>
                      <p className="truncate text-xs text-surface-500">{transfer.notes || transfer.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-surface-100">{formatRupiah(Number(transfer.amount))}</p>
                      <div className="flex justify-end text-surface-500">
                        <ArrowDownLeft size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {isExpanded && (
                    <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-surface-800/20 animate-fade-in">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(transfer); }}
                        className="flex items-center gap-1.5 rounded-lg border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 text-xs font-medium text-primary-400 transition-all hover:bg-primary-500/20"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(transfer.id); }}
                        className="flex items-center gap-1.5 rounded-lg border border-danger-500/30 bg-danger-500/10 px-3 py-1.5 text-xs font-medium text-danger-400 transition-all hover:bg-danger-500/20"
                      >
                        <Trash2 size={12} />
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <BottomSheet
        title="Edit Transfer"
        isOpen={!!editingTransfer}
        onClose={() => setEditingTransfer(null)}
      >
        {editingTransfer && (
          <EditTransferSheet
            transfer={editingTransfer}
            onClose={() => setEditingTransfer(null)}
          />
        )}
      </BottomSheet>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Hapus Transfer"
        description="Apakah Anda yakin ingin menghapus transfer wallet ini? Saldo masing-masing wallet akan dikembalikan seperti sebelum transfer ini terjadi."
        confirmText="Hapus Transfer"
      />
    </div>
  );
}

// ===== Edit Transfer Bottom Sheet =====

function EditTransferSheet({ transfer, onClose }: { transfer: WalletTransfer; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const { paymentMethods, updateWalletTransfer } = useBudgetStore();
  const [fromWalletId, setFromWalletId] = useState(transfer.from_payment_method_id);
  const [toWalletId, setToWalletId] = useState(transfer.to_payment_method_id);
  const [amount, setAmount] = useState(String(transfer.amount));
  const [notes, setNotes] = useState(transfer.notes || '');
  const [date, setDate] = useState(transfer.date);
  const [loading, setLoading] = useState(false);

  const isInvalid = !fromWalletId || !toWalletId || fromWalletId === toWalletId || !amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isInvalid) return;

    setLoading(true);
    try {
      await updateWalletTransfer(transfer.id, {
        from_payment_method_id: fromWalletId,
        to_payment_method_id: toWalletId,
        amount: parseFloat(amount),
        date,
        notes: notes || null,
      });
      toast.success('Transfer diperbarui! ✅');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      title="Edit Transfer"
      isOpen={true}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pb-8 pt-2">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-medium text-surface-400">Dari</span>
              <select
                value={fromWalletId}
                onChange={(e) => setFromWalletId(e.target.value)}
                className="min-w-0 rounded-xl border border-surface-700 bg-surface-800/50 px-3 py-3 text-sm text-surface-100 outline-none focus:border-primary-500"
              >
                <option value="">Pilih</option>
                {paymentMethods.map((w) => (
                  <option key={w.id} value={w.id}>{getPaymentIconText(w.icon)} {w.name}</option>
                ))}
              </select>
            </label>
            <ArrowRight size={18} className="mt-6 text-surface-500" />
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-medium text-surface-400">Ke</span>
              <select
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                className="min-w-0 rounded-xl border border-surface-700 bg-surface-800/50 px-3 py-3 text-sm text-surface-100 outline-none focus:border-primary-500"
              >
                <option value="">Pilih</option>
                {paymentMethods.map((w) => (
                  <option key={w.id} value={w.id}>{getPaymentIconText(w.icon)} {w.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-300">Jumlah *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">Rp</span>
              <RupiahInput
                value={amount}
                onChange={setAmount}
                placeholder="0"
                className="w-full rounded-xl border border-surface-700 bg-surface-800/50 py-3 pl-12 pr-4 text-lg font-bold tabular-nums text-surface-100 placeholder:text-surface-600 outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 outline-none focus:border-primary-500"
          />

          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan transfer (opsional)"
            className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 outline-none focus:border-primary-500"
          />

          <button
            type="submit"
            disabled={loading || isInvalid}
            className="flex items-center justify-center gap-2 rounded-xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Simpan Perubahan
          </button>
        </form>
      </form>
    </BottomSheet>
  );
}
