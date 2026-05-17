import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useTheme() {
  const theme = useAuthStore((s) => s.profile?.theme ?? 'dark');

  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    let resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    if (resolved === 'light') {
      root.classList.add('light');
      metaThemeColor?.setAttribute('content', '#f8fafc');
    } else {
      root.classList.remove('light');
      metaThemeColor?.setAttribute('content', '#030712');
    }

    // Listen for system changes when theme is 'system'
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.remove('light');
          metaThemeColor?.setAttribute('content', '#030712');
        } else {
          root.classList.add('light');
          metaThemeColor?.setAttribute('content', '#f8fafc');
        }
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);
}
