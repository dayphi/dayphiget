import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export function AlertSettingsSheet({ onClose }: Props) {
  const { profile, updateProfile } = useAuthStore();

  const [warningPct, setWarningPct] = useState(profile?.alert_warning_pct ?? 15);
  const [hutangPct, setHutangPct] = useState(profile?.alert_hutang_pct ?? 30);
  const [notifications, setNotifications] = useState(profile?.notifications ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        alert_warning_pct: warningPct,
        alert_hutang_pct: hutangPct,
        notifications,
      });
      toast.success('Pengaturan alert disimpan');
      onClose();
    } catch {
      toast.error('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-2">
      {/* Notifications toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-surface-200">Notifikasi</p>
          <p className="text-xs text-surface-500">Aktifkan peringatan budget</p>
        </div>
        <button
          onClick={() => setNotifications(!notifications)}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            notifications ? 'bg-primary-500' : 'bg-surface-700'
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              notifications ? 'translate-x-5.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Warning threshold */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-surface-300">
          Threshold Warning Budget
        </label>
        <p className="text-xs text-surface-500">
          Alert muncul saat sisa budget kurang dari {warningPct}% pendapatan
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={50}
            value={warningPct}
            onChange={(e) => setWarningPct(parseInt(e.target.value))}
            className="flex-1 accent-primary-500"
          />
          <span className="w-12 text-right text-sm font-bold text-primary-400 tabular-nums">
            {warningPct}%
          </span>
        </div>
      </div>

      {/* Hutang ratio threshold */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-surface-300">
          Threshold Rasio Hutang
        </label>
        <p className="text-xs text-surface-500">
          Alert muncul saat total cicilan melebihi {hutangPct}% pendapatan
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={10}
            max={60}
            value={hutangPct}
            onChange={(e) => setHutangPct(parseInt(e.target.value))}
            className="flex-1 accent-warning-500"
          />
          <span className="w-12 text-right text-sm font-bold text-warning-400 tabular-nums">
            {hutangPct}%
          </span>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 rounded-xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-primary-600/40 disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          'Simpan Pengaturan'
        )}
      </button>
    </div>
  );
}
