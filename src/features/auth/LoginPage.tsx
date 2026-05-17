import { useState } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { APP_NAME } from '@/lib/constants';
import { Eye, EyeOff, Loader2, TrendingUp } from 'lucide-react';

export function LoginPage() {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-950 px-4 gradient-mesh">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary-600/20">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gradient">{APP_NAME}</h1>
        <p className="text-sm text-surface-400">Kelola keuanganmu dengan cerdas</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm glass-card p-6 animate-slide-up">
        <h2 className="mb-6 text-center text-lg font-semibold text-surface-100">
          Masuk ke Akunmu
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-400 animate-fade-in">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-sm font-medium text-surface-300">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-sm font-medium text-surface-300">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-3 pr-12 text-sm text-surface-100 placeholder:text-surface-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:shadow-primary-600/40 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-400">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
