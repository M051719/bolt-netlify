import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      logout: () => set({ user: null, isAuthenticated: false }),
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