import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/lib/useTheme';

// Layout
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard, GuestGuard } from '@/features/auth/AuthGuard';

// Pages
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';
import { BudgetPage } from '@/features/budget/BudgetPage';
import { HutangPage } from '@/features/hutang/HutangPage';
import { WalletPage } from '@/features/wallet/WalletPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useTheme();

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          className: '!border-surface-700/50 !text-surface-100',
          duration: 3000,
          style: {
            background: 'var(--color-surface-800)',
            border: '1px solid var(--color-surface-700)',
            borderRadius: 'var(--radius-xl)',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
          },
        }}
        richColors
      />

      <Routes>
        {/* Guest routes */}
        <Route
          path="/login"
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />
        <Route
          path="/register"
          element={
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          }
        />

        {/* Onboarding (authenticated but no layout) */}
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <OnboardingWizard />
            </AuthGuard>
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="hutang" element={<HutangPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
