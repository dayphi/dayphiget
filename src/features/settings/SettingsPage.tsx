import { useAuthStore } from '@/stores/authStore';
import { APP_NAME, APP_VERSION } from '@/lib/constants';
import { Moon, Sun, Monitor, Download, Trash2, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { profile, updateProfile, signOut } = useAuthStore();
  const theme = profile?.theme || 'dark';

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  const menuItems = [
    { label: 'Kategori', desc: 'Kelola kategori pengeluaran', icon: '📂' },
    { label: 'Metode Pembayaran', desc: 'Cash, transfer, e-wallet', icon: '💳' },
    { label: 'Sumber Pendapatan', desc: 'Gaji, freelance, dll', icon: '💰' },
    { label: 'Alert & Notifikasi', desc: 'Atur threshold peringatan', icon: '🔔' },
  ];

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
          <button key={item.label} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-800/30">
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
        <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-800/30">
          <Download size={18} className="text-primary-400" />
          <span className="text-sm text-surface-200">Export Data (CSV)</span>
        </button>
        <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-800/30">
          <Trash2 size={18} className="text-danger-400" />
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
    </div>
  );
}
