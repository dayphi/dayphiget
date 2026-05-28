import { useState, useMemo, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import {
  Home,
  Receipt,
  PieChart,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Moon,
  Sun,
  Monitor,
  X,
} from 'lucide-react';
import { cn, formatRupiah } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/transactions', label: 'Transaksi', icon: Receipt },
  { path: '/wallet', label: 'Wallet', icon: CreditCard },
  { path: '/budget', label: 'Budget', icon: PieChart },
  { path: '/settings', label: 'Lainnya', icon: Settings },
];

export function AppLayout() {
  const location = useLocation();
  const signOut = useAuthStore((s) => s.signOut);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const { summary, hutangList, fetchAll } = useBudgetStore();
  const [showAlerts, setShowAlerts] = useState(false);
  const theme = profile?.theme || 'dark';
  const ThemeIcon = theme === 'light' ? Sun : theme === 'system' ? Monitor : Moon;

  useEffect(() => {
    if (user) {
      fetchAll(user.id);
    }
  }, [user, fetchAll]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    updateProfile({ theme: nextTheme });
  };

  const alerts = useMemo(() => {
    const list: { id: string; message: string; severity: 'info' | 'warning' | 'danger' }[] = [];
    if (!summary) return list;

    const warningPct = profile?.alert_warning_pct ?? 15;
    const hutangPct = profile?.alert_hutang_pct ?? 30;
    const totalIncome = summary.totalIncome;

    if (summary.status === 'deficit') {
      list.push({ id: 'deficit', message: `Budget deficit! Pengeluaran melebihi pemasukan sebesar ${formatRupiah(Math.abs(summary.sisaBudget))}`, severity: 'danger' });
    } else if (totalIncome > 0 && (summary.sisaBudget / totalIncome) * 100 < warningPct) {
      list.push({ id: 'warning', message: `Sisa budget tinggal ${Math.round((summary.sisaBudget / totalIncome) * 100)}% — di bawah threshold ${warningPct}%`, severity: 'warning' });
    }

    if (summary.todaySpent > summary.dailyLimit) {
      list.push({ id: 'daily', message: `Spending hari ini (${formatRupiah(summary.todaySpent)}) melebihi limit harian (${formatRupiah(summary.dailyLimit)})`, severity: 'warning' });
    }

    if (totalIncome > 0 && (summary.totalHutang / totalIncome) * 100 > hutangPct) {
      list.push({ id: 'hutang_ratio', message: `Rasio cicilan ${Math.round((summary.totalHutang / totalIncome) * 100)}% melebihi threshold ${hutangPct}%`, severity: 'danger' });
    }

    const today = new Date().getDate();
    hutangList.filter((h) => h.is_active && h.due_day).forEach((h) => {
      const diff = (h.due_day! - today + 31) % 31;
      if (diff <= 3 && diff >= 0) {
        list.push({ id: `due-${h.id}`, message: `${h.name} jatuh tempo ${diff === 0 ? 'hari ini' : `${diff} hari lagi`} (tgl ${h.due_day})`, severity: diff === 0 ? 'danger' : 'warning' });
      }
    });

    if (list.length === 0) {
      list.push({ id: 'ok', message: 'Semua aman! Tidak ada peringatan.', severity: 'info' });
    }

    return list;
  }, [summary, hutangList, profile]);

  const hasWarnings = alerts.some((a) => a.severity !== 'info');

  return (
    <div className="flex min-h-dvh flex-col bg-surface-950">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-700/70 bg-surface-900 px-4 py-3 shadow-lg shadow-black/20">
        <h1 className="text-lg font-bold text-gradient">{APP_NAME}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
            aria-label={`Tema ${theme}`}
            title={`Tema: ${theme === 'dark' ? 'Gelap' : theme === 'light' ? 'Terang' : 'Sistem'}`}
          >
            <ThemeIcon size={20} />
          </button>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {hasWarnings && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500" />}
          </button>
          <button
            onClick={signOut}
            className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
            aria-label="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Alerts dropdown */}
      {showAlerts && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowAlerts(false)} />
          <div className="fixed top-14 right-3 z-40 w-80 bg-surface-800 border border-surface-700 rounded-xl shadow-xl shadow-black/40 animate-slide-down overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/50">
              <p className="text-sm font-semibold text-surface-200">Notifikasi</p>
              <button onClick={() => setShowAlerts(false)} className="text-surface-500 hover:text-surface-300">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-surface-800/30">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 text-sm">
                    {alert.severity === 'danger' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🟢'}
                  </span>
                  <p className="text-xs text-surface-300 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Page content */}
      <main className="flex-1 px-4 pb-32 pt-2">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-surface-700/70 bg-surface-900 shadow-2xl shadow-black/30 safe-bottom">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 pt-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive =
              path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(path);

            return (
              <NavLink
                key={path}
                to={path}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-medium transition-all duration-200',
                  isActive
                    ? 'text-primary-400'
                    : 'text-surface-500 hover:text-surface-300'
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    'transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                <span className="max-w-full truncate">{label}</span>
                {isActive && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-primary-400" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
