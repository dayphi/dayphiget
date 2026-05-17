import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/types';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    // Prevent double initialization
    if (get().isInitialized) return;

    if (!isSupabaseConfigured) {
      set({ isLoading: false, isInitialized: true });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user, session });
        await get().fetchProfile();
      }
    } catch (err) {
      console.error('Auth init error:', err);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUserId = get().user?.id;
      const newUserId = session?.user?.id;

      // Skip token refreshes if user hasn't changed
      if (event === 'TOKEN_REFRESHED' && currentUserId === newUserId) {
        set({ session });
        return;
      }

      set({ user: session?.user ?? null, session });
      if (session?.user) {
        // Only re-fetch profile if user actually changed
        if (currentUserId !== newUserId) {
          await get().fetchProfile();
        }
      } else {
        set({ profile: null });
      }
    });
  },

  signUp: async (email, password) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: 'Gagal mendaftar. Coba lagi.' };
    }
  },

  signIn: async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: 'Gagal login. Coba lagi.' };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;

    // Retry a few times to handle race condition with trigger
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        set({ profile: data as Profile });
        return;
      }

      // Wait before retrying
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (data) {
      set({ profile: data as Profile });
    }
  },
}));
