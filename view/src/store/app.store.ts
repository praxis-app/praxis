import { create } from 'zustand';
import { LocalStorageKeys } from '../constants/shared.constants';

interface AppState {
  isAppLoading: boolean;
  setIsAppLoading(isAppLoading: boolean): void;
}

export const useAppStore = create<AppState>((set) => ({
  isAppLoading: !!localStorage.getItem(LocalStorageKeys.AccessToken),

  setIsAppLoading(isAppLoading) {
    set({ isAppLoading });
  },
}));
