import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { supabase } from '@/lib/supabase';
import { APP_NAME, APP_VERSION } from '@/lib/constants';
import { Moon, Sun, Monitor, Download, Trash2, LogOut, ChevronRight, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ManageCategoriesSheet } from './ManageCategoriesSheet';
import { ManagePaymentMethodsSheet } from './ManagePaymentMethodsSheet';
import { ManageIncomeSheet } from './ManageIncomeSheet';
import { AlertSettingsSheet } from './AlertSettingsSheet';

type SheetType = 'categories' | 'payment' | 'income' | 'alerts' | null;

export function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuthStore();
  const { transactions } = useBudgetStore();
  const theme = profile?.theme || 'dark';
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [resetting, setResetting] = useState(false);

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  const menuItems: { key: SheetType; label: string; desc: string; icon: string }[] = [
    { key: 'categories', label: 'Kategori', desc: 'Kelola kategori pengeluaran', icon: '📂' },
    { key: 'payment', label: 'Metode Pembayaran', desc: 'Cash, transfer, e-wallet', icon: '💳' },
    { key: 'income', label: 'Sumber Pendapatan', desc: 'Gaji, freelance, dll', icon: '💰' },
    { key: 'alerts', label: 'Alert & Notifikasi', desc: 'Atur threshold peringatan', icon: '🔔' },
  ];

  const sheetTitles: Record<string, string> = {
    categories: 'Kelola Kategori',
    payment: 'Metode Pembayaran',
    income: 'Sumber Pendapatan',
    alerts: 'Alert & Notifikasi',
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('Tidak ada data transaksi untuk diexport');
      return;
    }

    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Metode Bayar', 'Catatan'];
    const rows = transactions.map((tx) => [
      tx.date,
      tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      tx.category?.name || '-',
      tx.amount.toString(),
      tx.payment_method?.name || '-',
      tx.notes || '-',
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayphi-budget-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data berhasil diexport!');
  };

  const handleReset = async () => {
    if (!user) return;
    const confirmed = confirm(
      'PERHATIAN: Semua data transaksi, kategori, metode pembayaran, sumber pendapatan, dan hutang akan dihapus permanen. Lanjutkan?'
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      await supabase.from('transactions').delete().eq('user_id', user.id);
      await supabase.from('budget_items').delete().in(
        'budget_id',
        (await supabase.from('budgets').select('id').eq('user_id', user.id)).data?.map((b) => b.id) || []
      );
      await supabase.from('budgets').delete().eq('user_id', user.id);
      await supabase.from('hutang').delete().eq('user_id', user.id);
      await supabase.from('categories').delete().eq('user_id', user.id);
      await supabase.from('payment_methods').delete().eq('user_id', user.id);
      await supabase.from('income_sources').delete().eq('user_id', user.id);
      await supabase.from('scenarios').delete().eq('user_id', user.id);
      await supabase.from('quick_templates').delete().eq('user_id', user.id);

      toast.success('Semua data berhasil direset');
      window.location.reload();
    } catch {
      toast.error('Gagal mereset data');
    } finally {
      setResetting(false);
    }
  };

  const renderSheet = () => {
    switch (activeSheet) {
      case 'categories':
        return <ManageCategoriesSheet onClose={() => setActiveSheet(null)} />;
      case 'payment':
        return <ManagePaymentMethodsSheet onClose={() => setActiveSheet(null)} />;
      case 'income':
        return <ManageIncomeSheet onClose={() => setActiveSheet(null)} />;
      case 'alerts':
        return <AlertSettingsSheet onClose={() => setActiveSheet(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <h2 className="text-lg font-bold text-surface-100">Pengaturan</h2>

      {/* Profile */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-lg font-bold text-white">
            {(profile?.display_name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-surface-100">{profile?.display_name || 'User'}</p>
            <p className="text-xs text-surface-400">{profile?.currency || 'IDR'}</p>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="glass-card p-4">
        <p className="mb-3 text-sm font-medium text-surface-300">Tema</p>
        <div className="flex gap-2">
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => updateProfile({ theme: value })}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-all',
                theme === value
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-surface-700/50 text-surface-400 hover:border-surface-600'
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="glass-card divide-y divide-surface-800/50">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSheet(item.key)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-800/30"
          >
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-200">{item.label}</p>
              <p className="text-xs text-surface-500">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-surface-600" />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="glass-card divide-y divide-surface-800/50">
        <button
          onClick={handleExportCSV}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-800/30"
        >
          <Download size={18} className="text-primary-400" />
          <span className="text-sm text-surface-200">Export Data (CSV)</span>
        </button>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-800/30 disabled:opacity-50"
        >
          {resetting ? <Loader2 size={18} className="text-danger-400 animate-spin" /> : <Trash2 size={18} className="text-danger-400" />}
          <span className="text-sm text-danger-400">Reset Semua Data</span>
        </button>
        <button onClick={signOut} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-800/30">
          <LogOut size={18} className="text-surface-400" />
          <span className="text-sm text-surface-300">Keluar</span>
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-surface-600 pb-4">
        {APP_NAME} v{APP_VERSION}
      </p>

      {/* Bottom Sheet for sub-pages */}
      {activeSheet && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setActiveSheet(null)} />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-surface-900 border-t border-surface-700/50 animate-slide-up safe-bottom">
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-surface-600" />
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="text-lg font-bold text-surface-100">{sheetTitles[activeSheet]}</h2>
              <button
                onClick={() => setActiveSheet(null)}
                className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {renderSheet()}
          </div>
        </>
      )}
    </div>
  );
}
