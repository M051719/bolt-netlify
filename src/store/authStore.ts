import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  membershipTier: 'free' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'incomplete';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateMembership: (tier: 'free' | 'pro' | 'enterprise', subscriptionData?: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: async () => {
        // Sign out from Supabase
        await supabase.auth.signOut();
        // Update local state
        set({ user: null, isAuthenticated: false });
      },
      updateMembership: (tier, subscriptionData) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                membershipTier: tier,
                ...subscriptionData,
              }
            : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    const metadata = session.user.user_metadata;
    
    useAuthStore.getState().login({
      id: session.user.id,
      email: session.user.email || '',
      name: metadata?.name || session.user.email?.split('@')[0] || 'User',
      membershipTier: metadata?.membershipTier || 'free',
      stripeCustomerId: metadata?.stripeCustomerId,
      subscriptionId: metadata?.subscriptionId,
      subscriptionStatus: metadata?.subscriptionStatus,
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.getState().logout();
  }
});