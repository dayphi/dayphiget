import { Outlet, NavLink, useLocation } from 'react-router';
import {
  Home,
  Receipt,
  PieChart,
  CreditCard,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/transactions', label: 'Transaksi', icon: Receipt },
  { path: '/budget', label: 'Budget', icon: PieChart },
  { path: '/hutang', label: 'Hutang', icon: CreditCard },
  { path: '/settings', label: 'Lainnya', icon: Settings },
];

export function AppLayout() {
  const location = useLocation();
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <div className="flex min-h-dvh flex-col bg-surface-950">
      {/* Top Header */}
      <header className="glass sticky top-0 z-30 flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold text-gradient">{APP_NAME}</h1>
        <div className="flex items-center gap-2">
          <button
            className="relative rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500" />
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

      {/* Page content */}
      <main className="flex-1 px-4 pb-24 pt-2">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-30 safe-bottom">
        <div className="mx-auto flex max-w-lg items-center justify-around py-1">
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
                  'flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200',
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
                <span>{label}</span>
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
