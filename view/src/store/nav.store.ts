import { create } from 'zustand';

interface NavState {
  isNavSheetOpen: boolean;
  setIsNavSheetOpen(isNavSheetOpen: boolean): void;
}

export const useNavStore = create<NavState>((set) => ({
  isNavSheetOpen: false,

  setIsNavSheetOpen(isNavSheetOpen) {
    set({ isNavSheetOpen });
  },
}));
