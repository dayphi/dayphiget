import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-sm text-surface-400">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if profile missing or not completed
  if (location.pathname !== '/onboarding') {
    if (!profile || !profile.onboarding_completed) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
