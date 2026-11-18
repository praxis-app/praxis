// TODO: Clean up auth state management

import { create } from 'zustand';
import { LocalStorageKeys } from '../constants/shared.constants';

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  inviteToken: string | null;
  setIsLoggedIn(isLoggedIn: boolean): void;
  setAccessToken(accessToken: string | null): void;
  setInviteToken(inviteToken: string | null): void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  accessToken: localStorage.getItem(LocalStorageKeys.AccessToken),
  inviteToken: localStorage.getItem(LocalStorageKeys.InviteToken),

  setIsLoggedIn(isLoggedIn) {
    set({ isLoggedIn });
  },
  setAccessToken(accessToken) {
    set({ accessToken });
  },
  setInviteToken(inviteToken) {
    set({ inviteToken });
  },
}));
